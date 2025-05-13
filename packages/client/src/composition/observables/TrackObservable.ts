import { DocumentTrack, MediaTrack, pageSchema } from "@taep/core";
import { merge } from "lodash-es";
import { makeAutoObservable, toJS } from "mobx";
import { DeepPartial } from "../../utilities/types";
import { Editor } from "../prosemirror/Editor";
import { CompositionObservable } from "./CompositionObservable";

export type TrackObservable = MediaTrackObservable | DocumentTrackObservable;

export class MediaTrackObservable {
  private composition: CompositionObservable;
  state: MediaTrack;

  constructor(composition: CompositionObservable, state: MediaTrack) {
    makeAutoObservable(this);

    this.composition = composition;
    this.state = state;
  }

  setState(state: DeepPartial<MediaTrack>) {
    merge(this.state, state);
  }

  toJSON(): MediaTrack {
    return toJS(this.state);
  }
}

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
