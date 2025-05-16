import { MediaSegment, MediaTrack } from "@taep/core";
import { merge, omit } from "lodash-es";
import { makeAutoObservable, toJS } from "mobx";
import { DeepPartial } from "../../utilities/types";
import type { CompositionObservable } from "./CompositionObservable";
import { EventChangeMetadata, EventEmitter } from "../../utilities/EventEmitter";

export type MediaTrackEvents<T extends MediaTrack> = {
  change: (data: MediaTrackObservable<T>, metadata: EventChangeMetadata) => void;
  segmentChange: (data: MediaSegmentObservable, metadata: EventChangeMetadata) => void;
};

export class MediaTrackObservable<T extends MediaTrack = MediaTrack> extends EventEmitter<
  MediaTrackEvents<T>
> {
  composition: CompositionObservable;

  state: Omit<T, "content">;
  segments: Record<string, MediaSegmentObservable<T["content"][""]>> = {};

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

  createSegment(segment: T["content"][""]) {
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

export type MediaSegmentEvents<T extends MediaSegment> = {
  change: (data: MediaSegmentObservable<T>, metadata: EventChangeMetadata) => void;
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

    const metadata: EventChangeMetadata = { action: "updated" };
    this.emit("change", this, metadata);
    this.track.emit("segmentChange", this, metadata);
    this.track.composition.emit("segmentChange", this, metadata);
  }

  toJSON(): T {
    return toJS(this.state);
  }
}
