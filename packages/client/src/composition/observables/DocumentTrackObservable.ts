import { DocumentSegment, DocumentTrack, NodeGroup, pageSchema } from "@taep/core";
import { omit } from "lodash-es";
import { makeAutoObservable, toJS } from "mobx";
import { DocumentEditor } from "../prosemirror/DocumentEditor";
import type { CompositionObservable } from "./CompositionObservable";

export class DocumentTrackObservable {
  composition: CompositionObservable;

  state: Omit<DocumentTrack, "content">;
  editor: DocumentEditor;
  segments: Record<string, DocumentSegmentObservable> = {};

  constructor(composition: CompositionObservable, state: DocumentTrack) {
    makeAutoObservable(this);
    this.composition = composition;

    this.state = omit(state, "content");
    this.editor = new DocumentEditor({
      doc: pageSchema.nodeFromJSON(state),
      extensions: [
        // define all the extensions here...
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
