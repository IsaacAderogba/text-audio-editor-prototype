import { CompositionState } from "@taep/core";
import { makeAutoObservable } from "mobx";
import { MetadataObservable } from "./MetadataObservable";
import { MediaTrackObservable, DocumentTrackObservable, TrackObservable } from "./TrackObservable";

export class CompositionObservable {
  state: {
    tracks: Record<string, TrackObservable>;
    metadata: MetadataObservable;
  };

  constructor(state: CompositionState) {
    makeAutoObservable(this);

    const tracks: Record<string, TrackObservable> = {};
    Object.values(state.tracks).forEach(track => {
      if (track.type === "page") {
        tracks[track.attrs.id] = new DocumentTrackObservable(this, track);
      } else {
        tracks[track.attrs.id] = new MediaTrackObservable(this, track);
      }
    });

    this.state = { tracks, metadata: new MetadataObservable(this, state.metadata) };
  }

  toJSON(): CompositionState {
    const tracks: CompositionState["tracks"] = {};
    Object.values(this.state.tracks).forEach(track => {
      tracks[track.state.attrs.id] = track.toJSON();
    });

    return { tracks, metadata: this.state.metadata.toJSON() };
  }
}
