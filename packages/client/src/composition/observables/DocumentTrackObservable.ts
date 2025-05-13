import { DocumentTrack, pageSchema } from "@taep/core";
import { makeAutoObservable, toJS } from "mobx";
import type { CompositionObservable } from "./CompositionTrackObservable";
import { Editor } from "../prosemirror/Editor";

export class DocumentTrackObservable {
  private composition: CompositionObservable;
  state: DocumentTrack;
  editor: Editor;

  constructor(composition: CompositionObservable, state: DocumentTrack) {
    makeAutoObservable(this);

    this.composition = composition;
    this.state = state;
    this.editor = new Editor({
      doc: pageSchema.nodeFromJSON(state),
      extensions: [
        // define all the extensions here...
      ],
      context: { composition }
    });
  }

  setState(state: DocumentTrack) {
    this.state = state;
  }

  toJSON(): DocumentTrack {
    return toJS(this.state);
  }
}
