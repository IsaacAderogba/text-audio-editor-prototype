import { NodeGroup, pageSchema, PageSegment, PageTrack } from "@taep/core";
import { isArray, mergeWith } from "lodash-es";
import { makeAutoObservable, toJS } from "mobx";
import { Node } from "prosemirror-model";
import { Transaction } from "prosemirror-state";
import { v4 } from "uuid";
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
};
export class PageTrackObservable extends EventEmitter<PageTrackEvents> {
  composition: CompositionObservable;

  editor: DocumentEditor;
  segments: Record<string, PageSegmentObservable> = {};

  constructor(composition: CompositionObservable, state: PageTrack) {
    super();

    makeAutoObservable(this, { editor: false });
    this.composition = composition;
    this.editor = new DocumentEditor(v4(), {
      doc: pageSchema.nodeFromJSON(state),
      extensions: [
        new AttrsExtension(),
        new CollabExtension({
          publish: async change => {
            return await client.chapter.pageCompositionChange.mutate({
              type: "page",
              where: { chapterId: composition.chapter.state.id, trackId: state.attrs.id },
              data: { action: "updated", change }
            });
          },
          onSubscribe: dispatch => {
            const { unsubscribe } = client.chapter.documentCompositionChange.subscribe(
              { where: { chapterId: composition.chapter.state.id, trackId: state.attrs.id } },
              {
                onData: message => {
                  if ("version" in message.data) dispatch(message.data);
                },
                onError: err => console.error("error", err)
              }
            );

            return unsubscribe;
          }
        }),
        new CommandsExtension(),
        new HistoryExtension(),

        new BoldExtension(),

        new PageExtension(),
        new ParagraphExtension(),
        new VoiceExtension(),
        new TextExtension()
      ],
      onStateTransaction: this.handleUpdate,
      context: { track: this }
    });

    this.editor.state.doc.descendants(node => {
      if (!node.type.isInGroup(NodeGroup.segment)) return;
      this.segments[node.attrs.id] = new PageSegmentObservable(this, node.toJSON());
    });
  }

  handleUpdate = (transaction: Transaction) => {
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
        segment.listeners.clear();
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
  };

  update(state: DeepPartialBy<Partial<Omit<PageTrack, "type">>, "attrs">) {
    this.editor.chain().updateTrack(state).run();
  }

  toJSON(): PageTrack {
    return this.editor.state.toJSON();
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
