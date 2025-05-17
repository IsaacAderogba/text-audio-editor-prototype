import { CompositionMessage, VideoSegment, VideoTrack } from "@taep/core";
import { merge, omit } from "lodash-es";
import { makeAutoObservable, toJS } from "mobx";
import { EventChangeMetadata, EventEmitter } from "../../utilities/EventEmitter";
import { DeepPartial } from "../../utilities/types";
import type { CompositionObservable } from "./CompositionObservable";

type VideoTrackEvents = {
  change: (data: VideoTrackObservable, metadata: EventChangeMetadata) => void;
  segmentChange: (data: VideoSegmentObservable, metadata: EventChangeMetadata) => void;
};

export class VideoTrackObservable extends EventEmitter<VideoTrackEvents> {
  composition: CompositionObservable;

  state: Omit<VideoTrack, "content">;
  segments: Record<string, VideoSegmentObservable> = {};

  constructor(composition: CompositionObservable, state: VideoTrack) {
    super();

    makeAutoObservable(this);
    this.composition = composition;
    this.state = omit(state, "content");
    Object.values(state.content).forEach(segment => this.createSegment(segment));
  }

  handleUpdateMessage(message: CompositionMessage) {}

  update(state: DeepPartial<Pick<VideoTrack, "attrs">>) {
    merge(this.state.attrs, state.attrs, { updatedAt: new Date().toISOString() });

    this.emit("change", this, { action: "updated" });
    this.composition.emit("trackChange", this, { action: "updated" });
  }

  createSegment(segment: VideoSegment) {
    this.segments[segment.attrs.id] = new VideoSegmentObservable(this, segment);
    this.emit("segmentChange", this.segments[segment.attrs.id], { action: "created" });
  }

  deleteSegment(id: string) {
    const segment = this.segments[id];
    if (segment) {
      delete this.segments[id];
      this.emit("segmentChange", segment, { action: "deleted" });
    }
  }

  toJSON() {
    const content: Record<string, VideoSegment> = {};
    Object.values(this.segments).forEach(segment => {
      content[segment.state.attrs.id] = segment.toJSON();
    });

    return { ...toJS(this.state), content } as VideoTrack;
  }
}

type VideoSegmentEvents = {
  change: (data: VideoSegmentObservable, metadata: EventChangeMetadata) => void;
};

export class VideoSegmentObservable extends EventEmitter<VideoSegmentEvents> {
  track: VideoTrackObservable;
  state: VideoSegment;

  constructor(track: VideoTrackObservable, state: VideoSegment) {
    super();

    makeAutoObservable(this);
    this.track = track;
    this.state = state;
  }

  update(state: DeepPartial<Pick<VideoSegment, "attrs">>) {
    merge(this.state.attrs, state.attrs, { updatedAt: new Date().toISOString() });

    const metadata: EventChangeMetadata = { action: "updated" };
    this.emit("change", this, metadata);
    this.track.emit("segmentChange", this, metadata);
    this.track.composition.emit("segmentChange", this, metadata);
  }

  toJSON(): VideoSegment {
    return toJS(this.state);
  }
}
