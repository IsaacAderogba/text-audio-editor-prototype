import { MediaSegment, MediaTrack } from "@taep/core";
import { merge, omit } from "lodash-es";
import { makeAutoObservable, toJS } from "mobx";
import { DeepPartial } from "../../utilities/types";
import type { CompositionObservable } from "./CompositionObservable";

export class MediaTrackObservable {
  composition: CompositionObservable;

  state: Omit<MediaTrack, "content">;
  segments: Record<string, MediaSegmentObservable<MediaSegment>> = {};

  constructor(composition: CompositionObservable, state: MediaTrack) {
    makeAutoObservable(this);
    this.composition = composition;

    this.state = omit(state, "content");
    Object.values(state.content).forEach(segment => {
      this.segments[segment.attrs.id] = new MediaSegmentObservable(this, segment);
    });
  }

  update(state: DeepPartial<Pick<MediaSegment, "attrs">>) {
    merge(this.state.attrs, state.attrs, { updatedAt: new Date().toISOString() });

    this.composition.emit("trackChange", this, { action: "updated" });
    this.composition.emit("compositionChange", this.composition, { action: "updated" });
  }

  toJSON() {
    const content: Record<string, MediaSegment> = {};
    Object.values(this.segments).forEach(segment => {
      content[segment.state.attrs.id] = segment.toJSON();
    });

    return { ...toJS(this.state), content } as MediaTrack;
  }
}

export class MediaSegmentObservable<T extends MediaSegment = MediaSegment> {
  track: MediaTrackObservable;
  state: T;

  constructor(track: MediaTrackObservable, state: T) {
    makeAutoObservable(this);

    this.track = track;
    this.state = state;
  }

  update(state: DeepPartial<Pick<T, "attrs">>) {
    merge(this.state.attrs, state.attrs, { updatedAt: new Date().toISOString() });

    const composition = this.track.composition;
    composition.emit("segmentChange", this, { action: "updated" });
    composition.emit("trackChange", this.track, { action: "updated" });
    composition.emit("compositionChange", composition, { action: "updated" });
  }

  toJSON(): T {
    return toJS(this.state);
  }
}
