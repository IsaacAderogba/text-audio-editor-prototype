import { CompositionState } from "@taep/core";
import { makeAutoObservable } from "mobx";
import { DocumentTrackObservable } from "./document";
import { MetadataObservable } from "./MetadataObservable";
import { MediaTrackObservable } from "./media";

export interface CompositionObservableState {
  documentTracks: Record<string, DocumentTrackObservable>;
  mediaTracks: Record<string, MediaTrackObservable>;
  metadata: MetadataObservable;
}

export interface CompositionObservableOptions {}

export class CompositionObservable {
  state: CompositionObservableState;

  constructor(state: CompositionState) {
    makeAutoObservable(this);

    const documentTracks: Record<string, DocumentTrackObservable> = {};
    Object.values(state.documentTracks).forEach(editor => {
      documentTracks[editor.attrs.id] = new DocumentTrackObservable(this, editor);
    });

    const mediaTracks: Record<string, MediaTrackObservable> = {};
    Object.values(state.mediaTracks).forEach(track => {
      mediaTracks[track.attrs.id] = new MediaTrackObservable(this, track);
    });

    this.state = {
      documentTracks,
      mediaTracks,
      metadata: new MetadataObservable(this, state.metadata)
    };
  }

  toJSON(): CompositionState {
    const documentTracks: CompositionState["documentTracks"] = {};
    Object.values(this.state.documentTracks).forEach(editor => {
      documentTracks[editor.state.attrs.id] = editor.toJSON();
    });

    const mediaTracks: CompositionState["mediaTracks"] = {};
    Object.values(this.state.mediaTracks).forEach(track => {
      mediaTracks[track.state.attrs.id] = track.toJSON();
    });

    return {
      documentTracks,
      mediaTracks,
      metadata: this.state.metadata.toJSON()
    };
  }
}
