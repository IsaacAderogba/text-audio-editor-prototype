import { Composition } from "@taep/core";
import { makeAutoObservable, toJS } from "mobx";
import { omit } from "lodash-es";
import { DocumentSegmentObservable, DocumentTrackObservable } from "./DocumentTrackObservable";
import { MediaSegmentObservable, MediaTrackObservable } from "./MediaTrackObservable";

export type TrackObservable = DocumentTrackObservable | MediaTrackObservable;
export type SegmentObservable = DocumentSegmentObservable | MediaSegmentObservable;

export class CompositionObservable {
  state: Omit<Composition, "content">;
  tracks: Record<string, TrackObservable> = {};

  constructor(state: Composition) {
    makeAutoObservable(this);

    this.state = omit(state, "content");
    Object.values(state.content).forEach(track => {
      if (track.type === "page") {
        this.tracks[track.attrs.id] = new DocumentTrackObservable(this, track);
      } else {
        this.tracks[track.attrs.id] = new MediaTrackObservable(this, track);
      }
    });
  }

  toJSON(): Composition {
    const content: Composition["content"] = {};
    Object.values(this.tracks).forEach(track => {
      content[track.state.attrs.id] = track.toJSON();
    });

    return { ...toJS(this.state), content };
  }
}
