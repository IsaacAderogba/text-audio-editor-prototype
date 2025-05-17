import { VideoSegment, VideoTrack, VideoTrackDelta, VideoTrackDeltaStep } from "@taep/core";
import { merge, omit, throttle } from "lodash-es";
import { makeAutoObservable, toJS } from "mobx";
import { EventChangeMetadata, EventEmitter } from "../../utilities/EventEmitter";
import { client } from "../../utilities/trpc";
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

  steps: VideoTrackDeltaStep[] = [];
  handleDelta(delta: VideoTrackDelta) {
    for (const step of delta.steps) {
      if (step.data.type === "video") {
        this.update(step.data);
      } else if (step.action === "deleted") {
        this.deleteSegment(step.data.attrs.id);
      } else if (step.action === "updated" && this.segments[step.data.attrs.id]) {
        this.updateSegment(step.data.attrs.id, step.data);
      } else {
        this.createSegment(step.data);
      }
    }
  }

  sendDelta = throttle(async (delta: VideoTrackDelta) => {
    const index = this.steps.length - 1;
    const response = await client.chapter.videoCompositionChange.mutate({
      type: "video",
      where: { chapterId: this.composition.chapter.state.id, trackId: this.state.attrs.id },
      data: { action: "updated", change: delta }
    });

    this.steps = this.steps.slice(index);
    if (response.type === "delta") this.handleDelta(response);
  });

  createDeltaStep(step: VideoTrackDeltaStep) {
    this.steps.push(step);
    this.sendDelta({ type: "delta", clientId: this.composition.clientId, steps: this.steps });
  }

  update(state: DeepPartial<Pick<VideoTrack, "attrs">>) {
    merge(this.state.attrs, state.attrs, { updatedAt: new Date().toISOString() });

    this.emit("change", this, { action: "updated" });
    this.composition.emit("trackChange", this, { action: "updated" });
    this.createDeltaStep({ type: "video", action: "updated", data: toJS(this.state) });
  }

  createSegment(data: VideoSegment) {
    const segment = new VideoSegmentObservable(this, data);
    this.segments[data.attrs.id] = segment;
    this.emit("segmentChange", segment, { action: "created" });

    this.createDeltaStep({ type: "video", action: "created", data: segment.toJSON() });
  }

  updateSegment(id: string, data: DeepPartial<Pick<VideoSegment, "attrs">>) {
    this.segments[id]?.update(data);
  }

  deleteSegment(id: string) {
    const segment = this.segments[id];
    if (!segment) return;

    delete this.segments[id];
    this.emit("segmentChange", segment, { action: "deleted" });
    this.createDeltaStep({ type: "video", action: "deleted", data: segment.toJSON() });
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

    this.track.createDeltaStep({ type: "video", action: "updated", data: this.toJSON() });
  }

  toJSON(): VideoSegment {
    return toJS(this.state);
  }
}
