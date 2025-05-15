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

export class DocumentTrackObservable {
  composition: CompositionObservable;

  editor: DocumentEditor;
  segments: Record<string, DocumentSegmentObservable> = {};

  constructor(composition: CompositionObservable, state: DocumentTrack) {
    makeAutoObservable(this);
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
      onStateTransaction: this.onStateTransaction,
      context: { track: this }
    });

    this.editor.state.doc.descendants(node => {
      if (!node.type.isInGroup(NodeGroup.segment)) return;
      this.segments[node.attrs.id] = new DocumentSegmentObservable(
        composition,
        this,
        node.toJSON()
      );
    });
  }

  private onStateTransaction = (transaction: Transaction) => {
    this.editor.state = this.editor.state.apply(transaction);
    this.editor.view.updateState(this.editor.state);

    // diff segments and update them reactively
    // this should pick up on what changed, and emit an event...

    this.composition.emit("trackChange", this);
    this.composition.emit("compositionChange", this.composition);
  };

  setState(state: DeepPartialBy<Partial<Omit<DocumentTrack, "type">>, "attrs">) {
    this.editor.chain().updateTrack(state).run();
  }

  toJSON(): DocumentTrack {
    return this.editor.state.toJSON();
  }
}

export class DocumentSegmentObservable<T extends DocumentSegment = DocumentSegment> {
  composition: CompositionObservable;
  track: DocumentTrackObservable;
  state: T;

  constructor(composition: CompositionObservable, track: DocumentTrackObservable, state: T) {
    makeAutoObservable(this);

    this.composition = composition;
    this.track = track;
    this.state = state;
  }

  setState(state: DeepPartialBy<Partial<Omit<DocumentSegment, "type">>, "attrs">) {
    this.track.editor.chain().updateSegment(this.state.attrs.id, state).run();
  }

  toJSON(): T {
    return toJS(this.state);
  }
}
