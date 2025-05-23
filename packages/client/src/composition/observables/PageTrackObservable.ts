import { NodeGroup, pageSchema, PageSegment, PageTrack, PageTrackDelta } from "@taep/core";
import { isArray, mergeWith, omit, pick, throttle } from "lodash-es";
import { makeAutoObservable, toJS } from "mobx";
import { Node } from "prosemirror-model";
import { Transaction } from "prosemirror-state";
import { EventChangeMetadata, EventEmitter } from "../../utilities/EventEmitter";
import { client } from "../../utilities/trpc";
import { DeepPartialBy } from "../../utilities/types";
import { AttrsExtension } from "../extensions/hooks/AttrsExtension";
import { CollabExtension } from "../extensions/hooks/CollabExtension";
import { CommandsExtension } from "../extensions/hooks/CommandsExtension";
import { HistoryExtension } from "../extensions/hooks/HistoryExtension";
import { BoldExtension } from "../extensions/marks/BoldExtension";
import { PageExtension } from "../extensions/nodes/PageExtension";
import { ParagraphExtension } from "../extensions/nodes/ParagraphExtension";
import { TextExtension } from "../extensions/nodes/TextExtension";
import { VoiceExtension } from "../extensions/nodes/VoiceExtension";
import { DocumentEditor } from "../prosemirror/DocumentEditor";
import type { CompositionObservable } from "./CompositionObservable";

interface ChangeMetadata {
  action: "created" | "updated" | "deleted";
}

type PageTrackEvents = {
  change: (data: PageTrackObservable, metadata: ChangeMetadata) => void;
  segmentChange: (data: PageSegmentObservable, metadata: ChangeMetadata) => void;

  trackDelta: (data: PageTrackDelta) => void;
};
export class PageTrackObservable extends EventEmitter<PageTrackEvents> {
  composition: CompositionObservable;

  state: Pick<PageTrack, "version">;
  editor: DocumentEditor;
  segments: Record<string, PageSegmentObservable> = {};

  constructor(composition: CompositionObservable, state: PageTrack) {
    super();

    makeAutoObservable(this, { editor: false });
    this.composition = composition;
    this.state = pick(state, "version");
    this.editor = new DocumentEditor(this.composition.clientId, {
      doc: pageSchema.nodeFromJSON(omit(state, "version")),
      extensions: [
        new AttrsExtension(),
        new CollabExtension({ onDelta: async delta => this.sendDelta(delta) }),
        new CommandsExtension(),
        new HistoryExtension(),

        new BoldExtension(),

        new PageExtension(),
        new ParagraphExtension(),
        new VoiceExtension(),
        new TextExtension()
      ],
      onStateTransaction: this.handleTransaction,
      context: { track: this }
    });

    this.editor.state.doc.descendants(node => {
      if (!node.type.isInGroup(NodeGroup.segment)) return;
      this.segments[node.attrs.id] = new PageSegmentObservable(this, node.toJSON());
    });
  }

  handleTransaction(transaction: Transaction) {
    const prevState = this.editor.state;
    const nextState = this.editor.state.apply(transaction);

    const deletedSegments: Record<string, Node> = {};
    const updatedSegments: Record<string, Node> = {};
    const createdSegments: Record<string, Node> = {};

    if (transaction.docChanged) {
      const prevSegmentsById: Record<string, Node> = {};
      prevState.doc.descendants(node => {
        if (!node.type.isInGroup(NodeGroup.segment)) return;
        prevSegmentsById[node.attrs.id] = node;
      });

      const nextSegmentsById: Record<string, Node> = {};
      nextState.doc.descendants(node => {
        if (!node.type.isInGroup(NodeGroup.segment)) return;
        nextSegmentsById[node.attrs.id] = node;
      });

      for (const [id, node] of Object.entries(prevSegmentsById)) {
        if (!nextSegmentsById[id]) {
          deletedSegments[id] = node;
        } else if (node !== nextSegmentsById[id]) {
          updatedSegments[id] = node;
        }
      }

      for (const [id, node] of Object.entries(nextSegmentsById)) {
        if (!prevSegmentsById[id]) {
          createdSegments[id] = node;
        } else if (node !== prevSegmentsById[id]) {
          updatedSegments[id] = node;
        }
      }
    }

    this.editor.state = nextState;
    this.editor.view.updateState(this.editor.state);

    for (const [id] of Object.entries(deletedSegments)) {
      const segment = this.segments[id];
      if (segment) {
        delete this.segments[id];
        this.emit("segmentChange", segment, { action: "deleted" });
      }
    }

    for (const [id, node] of Object.entries(updatedSegments)) {
      const segment = this.segments[id];
      if (segment) {
        segment.handleUpdate(node.toJSON());
      } else {
        createdSegments[id] = node;
      }
    }

    for (const [id, node] of Object.entries(createdSegments)) {
      const segment = new PageSegmentObservable(this, node.toJSON());
      this.segments[id] = segment;
      this.emit("segmentChange", segment, { action: "created" });
    }

    this.emit("change", this, { action: "updated" });
    this.composition.emit("trackChange", this, { action: "updated" });
  }

  handleDelta(delta: PageTrackDelta) {
    this.state.version = delta.version;
    const extension = this.editor.extensions.get(CollabExtension.name);
    if (extension instanceof CollabExtension) extension.sendTrackDelta(delta);
  }

  sendDelta = throttle(async (delta: PageTrackDelta) => {
    const trackId = this.editor.state.doc.attrs.id;
    const response = await client.chapter.pageCompositionChange.mutate({
      type: "page",
      where: { chapterId: this.composition.chapter.state.id, trackId },
      data: { action: "updated", change: delta }
    });

    if (response.type === "delta") {
      this.handleDelta(response);
    } else {
      const extension = this.editor.extensions.get(CollabExtension.name);
      if (extension instanceof CollabExtension) extension.sendTrack(response);
    }
  });

  update(state: DeepPartialBy<Partial<Omit<PageTrack, "type">>, "attrs">) {
    this.editor.chain().updateTrack(state).run();
  }

  toJSON(): PageTrack {
    return { ...this.editor.state.toJSON(), version: this.state.version };
  }
}

type PageSegmentEvents = {
  change: (data: PageSegmentObservable, metadata: ChangeMetadata) => void;
};
export class PageSegmentObservable extends EventEmitter<PageSegmentEvents> {
  track: PageTrackObservable;
  state: PageSegment;

  constructor(track: PageTrackObservable, state: PageSegment) {
    super();

    makeAutoObservable(this);
    this.track = track;
    this.state = state;
  }

  handleUpdate = (state: PageSegment) => {
    mergeWith(this.state, state, (source, target) => {
      if (isArray(source)) return target || source;
    });

    const metadata: EventChangeMetadata = { action: "updated" };
    this.emit("change", this, metadata);
    this.track.emit("segmentChange", this, metadata);
    this.track.composition.emit("segmentChange", this, metadata);
  };

  update(state: DeepPartialBy<Partial<Omit<PageSegment, "type">>, "attrs">) {
    this.track.editor.chain().updateSegment(this.state.attrs.id, state).run();
  }

  toJSON(): PageSegment {
    return toJS(this.state);
  }
}
