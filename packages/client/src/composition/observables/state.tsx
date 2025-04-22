import { CompositionState } from "@taep/core";
import { makeAutoObservable } from "mobx";
import { CompositionEditorObservable } from "./editor";
import { CompositionMetadataObservable } from "./metadata";
import { CompositionTrackObservable } from "./track";

export interface CompositionObservableState {
  editors: Record<string, CompositionEditorObservable>;
  tracks: Record<string, CompositionTrackObservable>;
  metadata: CompositionMetadataObservable;
}

export interface CompositionObservableOptions {}

export class CompositionObservable {
  state: CompositionObservableState;

  constructor(state: CompositionState) {
    makeAutoObservable(this);

    const editors: CompositionObservableState["editors"] = {};
    Object.values(state.editors).forEach(editor => {
      editors[editor.attrs.id] = new CompositionEditorObservable(this, editor);
    });

    const tracks: CompositionObservableState["tracks"] = {};
    Object.values(state.tracks).forEach(track => {
      tracks[track.attrs.id] = new CompositionTrackObservable(this, track);
    });

    this.state = {
      editors,
      tracks,
      metadata: new CompositionMetadataObservable(this, state.metadata)
    };
  }

  toJSON(): CompositionState {
    const editors: CompositionState["editors"] = {};
    Object.values(this.state.editors).forEach(editor => {
      editors[editor.state.attrs.id] = editor.toJSON();
    });

    const tracks: CompositionState["tracks"] = {};
    Object.values(this.state.tracks).forEach(track => {
      tracks[track.state.attrs.id] = track.toJSON();
    });

    return {
      editors,
      tracks,
      metadata: this.state.metadata.toJSON()
    };
  }
}
