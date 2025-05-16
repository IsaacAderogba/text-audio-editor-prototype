import { DocumentSegment, DocumentTrack, NodeGroup, pageSchema } from "@taep/core";
import { makeAutoObservable, toJS } from "mobx";
import { DocumentEditor } from "../prosemirror/DocumentEditor";
import type { CompositionObservable } from "./CompositionObservable";
import { AttrsExtension } from "../extensions/hooks/AttrsExtension";
import { CollabExtension } from "../extensions/hooks/CollabExtension";
import { CommandsExtension } from "../extensions/hooks/CommandsExtension";
import { HistoryExtension } from "../extensions/hooks/HistoryExtension";
import { BoldExtension } from "../extensions/marks/BoldExtension";
import { PageExtension } from "../extensions/nodes/PageExtension";
import { ParagraphExtension } from "../extensions/nodes/ParagraphExtension";
import { TextExtension } from "../extensions/nodes/TextExtension";
import { VoiceExtension } from "../extensions/nodes/VoiceExtension";
import { v4 } from "uuid";
import { client } from "../../utilities/trpc";
import { DeepPartialBy } from "../../utilities/types";
import { Transaction } from "prosemirror-state";
import { isArray, mergeWith } from "lodash-es";
import { Node } from "prosemirror-model";

export class DocumentTrackObservable {
  composition: CompositionObservable;

  editor: DocumentEditor;
  segments: Record<string, DocumentSegmentObservable> = {};

  constructor(composition: CompositionObservable, state: DocumentTrack) {
    makeAutoObservable(this, { editor: false });
    this.composition = composition;

    this.editor = new DocumentEditor(v4(), {
      doc: pageSchema.nodeFromJSON(state),
      extensions: [
        new AttrsExtension(),
        new CollabExtension({
          publish: async change => {
            return await client.chapter.trackChange.mutate({
              action: "updated",
              data: { chapterId: composition.context.chapter.id, trackId: state.attrs.id, change }
            });
          },
          onSubscribe: dispatch => {
            const { unsubscribe } = client.chapter.onTrackChange.subscribe(
              { trackId: state.attrs.id },
              {
                onData: message => dispatch(message.data.change),
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
      onStateTransaction: this.handleStateChange,
      context: { track: this }
    });

    this.editor.state.doc.descendants(node => {
      if (!node.type.isInGroup(NodeGroup.segment)) return;
      this.segments[node.attrs.id] = new DocumentSegmentObservable(this, node.toJSON());
    });
  }

  handleStateChange = (transaction: Transaction) => {
    const prevState = this.editor.state;
    const nextState = this.editor.state.apply(transaction);

    const deletedSegments: Record<string, Node> = {};
    const changedSegments: Record<string, Node> = {};
    const addedSegments: Record<string, Node> = {};

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
          changedSegments[id] = node;
        }
      }

      for (const [id, node] of Object.entries(nextSegmentsById)) {
        if (!prevSegmentsById[id]) {
          addedSegments[id] = node;
        } else if (node !== prevSegmentsById[id]) {
          changedSegments[id] = node;
        }
      }
    }

    this.editor.state = nextState;
    this.editor.view.updateState(this.editor.state);

    for (const [id] of Object.entries(deletedSegments)) {
      const segment = this.segments[id];
      if (segment) {
        delete this.segments[id];
        this.composition.emit("segmentChange", segment, { action: "deleted" });
      }
    }

    for (const [id, node] of Object.entries(changedSegments)) {
      const segment = this.segments[id];
      if (segment) {
        segment.handleStateChange(node.toJSON());
        this.composition.emit("segmentChange", segment, { action: "updated" });
      } else {
        addedSegments[id] = node;
      }
    }

    for (const [id, node] of Object.entries(addedSegments)) {
      const segment = new DocumentSegmentObservable(this, node.toJSON());
      this.segments[id] = segment;
      this.composition.emit("segmentChange", segment, { action: "created" });
    }

    this.composition.emit("trackChange", this, { action: "updated" });
    this.composition.emit("compositionChange", this.composition, { action: "updated" });
  };

  update(state: DeepPartialBy<Partial<Omit<DocumentTrack, "type">>, "attrs">) {
    this.editor.chain().updateTrack(state).run();
  }

  toJSON(): DocumentTrack {
    return this.editor.state.toJSON();
  }
}

export class DocumentSegmentObservable<T extends DocumentSegment = DocumentSegment> {
  track: DocumentTrackObservable;
  state: T;

  constructor(track: DocumentTrackObservable, state: T) {
    makeAutoObservable(this);

    this.track = track;
    this.state = state;
  }

  handleStateChange = (state: T) => {
    mergeWith(this.state, state, (source, target) => {
      if (isArray(source)) return target || source;
    });
  };

  update(state: DeepPartialBy<Partial<Omit<DocumentSegment, "type">>, "attrs">) {
    this.track.editor.chain().updateSegment(this.state.attrs.id, state).run();
  }

  toJSON(): T {
    return toJS(this.state);
  }
}
