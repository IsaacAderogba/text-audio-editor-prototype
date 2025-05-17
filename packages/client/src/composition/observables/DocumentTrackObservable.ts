import {
  DocumentSegment,
  DocumentTrack,
  NodeGroup,
  pageSchema,
  PageSegment,
  PageTrack
} from "@taep/core";
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
import { ParagraphExtension } from "../extensions/nodes/ParagraphExtension";
import { TextExtension } from "../extensions/nodes/TextExtension";
import { VoiceExtension } from "../extensions/nodes/VoiceExtension";
import type { CompositionObservable } from "./CompositionObservable";
import { DocumentEditor } from "../prosemirror/DocumentEditor";
import { PageExtension } from "../extensions/nodes/PageExtension";

interface ChangeMetadata {
  action: "created" | "updated" | "deleted";
}

type DocumentTrackEvents<T extends DocumentTrack, S extends DocumentSegment> = {
  change: (data: DocumentTrackObservable<T, S>, metadata: ChangeMetadata) => void;
  segmentChange: (data: DocumentSegmentObservable<T, S>, metadata: ChangeMetadata) => void;
};
class DocumentTrackObservable<
  T extends DocumentTrack,
  S extends DocumentSegment
> extends EventEmitter<DocumentTrackEvents<T, S>> {
  composition: CompositionObservable;

  editor: DocumentEditor;
  segments: Record<string, DocumentSegmentObservable<T, S>> = {};

  constructor(composition: CompositionObservable, state: T) {
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
      this.segments[node.attrs.id] = new DocumentSegmentObservable(this, node.toJSON());
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
      const segment = new DocumentSegmentObservable(this, node.toJSON());
      this.segments[id] = segment;
      this.emit("segmentChange", segment, { action: "created" });
    }

    this.emit("change", this, { action: "updated" });
    this.composition.emit("trackChange", this, { action: "updated" });
  };

  update(state: DeepPartialBy<Partial<Omit<DocumentTrack, "type">>, "attrs">) {
    this.editor.chain().updateTrack(state).run();
  }

  toJSON(): T {
    return this.editor.state.toJSON();
  }
}

type DocumentSegmentEvents<T extends DocumentTrack, S extends DocumentSegment> = {
  change: (data: DocumentSegmentObservable<T, S>, metadata: ChangeMetadata) => void;
};
class DocumentSegmentObservable<
  T extends DocumentTrack,
  S extends DocumentSegment
> extends EventEmitter<DocumentSegmentEvents<T, S>> {
  track: DocumentTrackObservable<T, S>;
  state: S;

  constructor(track: DocumentTrackObservable<T, S>, state: S) {
    super();

    makeAutoObservable(this);
    this.track = track;
    this.state = state;
  }

  handleUpdate = (state: S) => {
    mergeWith(this.state, state, (source, target) => {
      if (isArray(source)) return target || source;
    });

    const metadata: EventChangeMetadata = { action: "updated" };
    this.emit("change", this, metadata);
    this.track.emit("segmentChange", this, metadata);
    this.track.composition.emit("segmentChange", this, metadata);
  };

  update(state: DeepPartialBy<Partial<Omit<DocumentSegment, "type">>, "attrs">) {
    this.track.editor.chain().updateSegment(this.state.attrs.id, state).run();
  }

  toJSON(): S {
    return toJS(this.state);
  }
}

export class PageTrackObservable extends DocumentTrackObservable<PageTrack, PageSegment> {}
export class PageSegmentObservable extends DocumentSegmentObservable<PageTrack, PageSegment> {}
