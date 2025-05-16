import { MediaSegment, MediaTrack } from "@taep/core";
import { merge, omit } from "lodash-es";
import { makeAutoObservable, toJS } from "mobx";
import { DeepPartial } from "../../utilities/types";
import type { CompositionObservable } from "./CompositionObservable";
import { EventEmitter } from "../../utilities/EventEmitter";

export type MediaTrackEvents = {
  update: (data: MediaTrackObservable) => void;
  segmentUpdate: (data: MediaSegmentObservable) => void;
};

export class MediaTrackObservable extends EventEmitter<MediaTrackEvents> {
  composition: CompositionObservable;

  state: Omit<MediaTrack, "content">;
  segments: Record<string, MediaSegmentObservable<MediaSegment>> = {};

  constructor(composition: CompositionObservable, state: MediaTrack) {
    super();

    makeAutoObservable(this);
    this.composition = composition;
    this.state = omit(state, "content");
    Object.values(state.content).forEach(segment => {
      this.segments[segment.attrs.id] = new MediaSegmentObservable(this, segment);
    });
  }

  update(state: DeepPartial<Pick<MediaSegment, "attrs">>) {
    merge(this.state.attrs, state.attrs, { updatedAt: new Date().toISOString() });

    this.emit("update", this);
    this.composition.emit("trackUpdate", this);
  }

  toJSON() {
    const content: Record<string, MediaSegment> = {};
    Object.values(this.segments).forEach(segment => {
      content[segment.state.attrs.id] = segment.toJSON();
    });

    return { ...toJS(this.state), content } as MediaTrack;
  }
}

export type MediaSegmentEvents<T extends MediaSegment> = {
  update: (data: MediaSegmentObservable<T>) => void;
};

export class MediaSegmentObservable<T extends MediaSegment = MediaSegment> extends EventEmitter<
  MediaSegmentEvents<T>
> {
  track: MediaTrackObservable;
  state: T;

  constructor(track: MediaTrackObservable, state: T) {
    super();

    makeAutoObservable(this);
    this.track = track;
    this.state = state;
  }

  update(state: DeepPartial<Pick<T, "attrs">>) {
    merge(this.state.attrs, state.attrs, { updatedAt: new Date().toISOString() });

    this.emit("update", this);
    this.track.emit("segmentUpdate", this);
    this.track.composition.emit("segmentUpdate", this);
  }

  toJSON(): T {
    return toJS(this.state);
  }
}
