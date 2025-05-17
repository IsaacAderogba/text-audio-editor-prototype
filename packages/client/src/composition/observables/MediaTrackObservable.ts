import {
  AudioSegment,
  AudioTrack,
  MediaSegment,
  MediaTrack,
  VideoSegment,
  VideoTrack
} from "@taep/core";
import { merge, omit } from "lodash-es";
import { makeAutoObservable, toJS } from "mobx";
import { DeepPartial } from "../../utilities/types";
import type { CompositionObservable } from "./CompositionObservable";
import { EventChangeMetadata, EventEmitter } from "../../utilities/EventEmitter";

type MediaTrackEvents<T extends MediaTrack, S extends MediaSegment> = {
  change: (data: MediaTrackObservable<T, S>, metadata: EventChangeMetadata) => void;
  segmentChange: (data: MediaSegmentObservable<T, S>, metadata: EventChangeMetadata) => void;
};

class MediaTrackObservable<
  T extends MediaTrack = MediaTrack,
  S extends MediaSegment = MediaSegment
> extends EventEmitter<MediaTrackEvents<T, S>> {
  composition: CompositionObservable;

  state: Omit<T, "content">;
  segments: Record<string, MediaSegmentObservable<T, S>> = {};

  constructor(composition: CompositionObservable, state: T) {
    super();

    makeAutoObservable(this);
    this.composition = composition;
    this.state = omit(state, "content");
    Object.values(state.content).forEach(segment => this.createSegment(segment));
  }

  update(state: DeepPartial<Pick<T, "attrs">>) {
    merge(this.state.attrs, state.attrs, { updatedAt: new Date().toISOString() });

    this.emit("change", this, { action: "updated" });
    this.composition.emit("trackChange", this, { action: "updated" });
  }

  createSegment(segment: S) {
    this.segments[segment.attrs.id] = new MediaSegmentObservable(this, segment);
    this.emit("segmentChange", this.segments[segment.attrs.id], { action: "created" });
  }

  deleteSegment(id: string) {
    const segment = this.segments[id];
    if (segment) {
      delete this.segments[id];
      segment.listeners.clear();
      this.emit("segmentChange", segment, { action: "deleted" });
    }
  }

  toJSON() {
    const content: Record<string, MediaSegment> = {};
    Object.values(this.segments).forEach(segment => {
      content[segment.state.attrs.id] = segment.toJSON();
    });

    return { ...toJS(this.state), content } as T;
  }
}

type MediaSegmentEvents<T extends MediaTrack, S extends MediaSegment> = {
  change: (data: MediaSegmentObservable<T, S>, metadata: EventChangeMetadata) => void;
};

class MediaSegmentObservable<
  T extends MediaTrack = MediaTrack,
  S extends MediaSegment = MediaSegment
> extends EventEmitter<MediaSegmentEvents<T, S>> {
  track: MediaTrackObservable<T, S>;
  state: S;

  constructor(track: MediaTrackObservable<T, S>, state: S) {
    super();

    makeAutoObservable(this);
    this.track = track;
    this.state = state;
  }

  update(state: DeepPartial<Pick<S, "attrs">>) {
    merge(this.state.attrs, state.attrs, { updatedAt: new Date().toISOString() });

    const metadata: EventChangeMetadata = { action: "updated" };
    this.emit("change", this, metadata);
    this.track.emit("segmentChange", this, metadata);
    this.track.composition.emit("segmentChange", this, metadata);
  }

  toJSON(): S {
    return toJS(this.state);
  }
}

export class VideoTrackObservable extends MediaTrackObservable<VideoTrack, VideoSegment> {}
export class VideoSegmentObservable extends MediaSegmentObservable<VideoTrack, VideoSegment> {}

export class AudioTrackObservable extends MediaTrackObservable<AudioTrack, AudioSegment> {}
export class AudioSegmentObservable extends MediaSegmentObservable<AudioTrack, AudioSegment> {}
