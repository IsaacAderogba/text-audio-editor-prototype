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
        new CollabExtension(),
        new CommandsExtension(),
        new HistoryExtension(),

        new BoldExtension(),

        new PageExtension(),
        new ParagraphExtension(),
        new VoiceExtension(),
        new TextExtension()
      ],
      context: { track: this }
    });

    this.editor.state.doc.descendants(node => {
      if (!node.type.isInGroup(NodeGroup.segment)) return;
      this.segments[node.attrs.id] = new DocumentSegmentObservable(this, node.toJSON());
    });
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

  setAttrs() {
    // update attrs using the editor...
  }

  toJSON(): T {
    return toJS(this.state);
  }
}
