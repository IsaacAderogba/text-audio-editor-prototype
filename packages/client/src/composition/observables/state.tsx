import { CompositionState } from "@taep/core";
import { makeAutoObservable } from "mobx";
import { CompositionEditorObservable } from "./editor";
import { CompositionMetadataObservable } from "./metadata";
import { CompositionSegmentObservable } from "./segment";
import { CompositionTrackObservable } from "./track";

export interface CompositionObservableState {
  editors: Record<string, CompositionEditorObservable>;
  tracks: Record<string, CompositionTrackObservable>;
  segments: Record<string, CompositionSegmentObservable>;
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
      tracks[track.id] = new CompositionTrackObservable(this, track);
    });

    const segments: CompositionObservableState["segments"] = {};
    Object.values(state.segments).forEach(segment => {
      segments[segment.id] = new CompositionSegmentObservable(this, segment);
    });

    this.state = {
      editors,
      tracks,
      segments,
      metadata: new CompositionMetadataObservable(this, state.metadata)
    };
  }

  toJSON(): CompositionState {
    const editors: CompositionState["editors"] = {};
    Object.values(this.state.editors).forEach(editor => {
      editors[editor.state.doc.attrs.id] = editor.toJSON();
    });

    const tracks: CompositionState["tracks"] = {};
    Object.values(this.state.tracks).forEach(track => {
      tracks[track.state.id] = track.toJSON();
    });

    const segments: CompositionState["segments"] = {};
    Object.values(this.state.segments).forEach(segment => {
      segments[segment.state.id] = segment.toJSON();
    });

    return {
      editors,
      tracks,
      segments,
      metadata: this.state.metadata.toJSON()
    };
  }
}
