import { AudioSegment, AudioTrack, AudioTrackDelta, AudioTrackDeltaStep } from "@taep/core";
import { merge, omit, throttle } from "lodash-es";
import { makeAutoObservable, toJS } from "mobx";
import { EventChangeMetadata, EventEmitter } from "../../utilities/EventEmitter";
import { client } from "../../utilities/trpc";
import { DeepPartial } from "../../utilities/types";
import type { CompositionObservable } from "./CompositionObservable";

type AudioTrackEvents = {
  change: (data: AudioTrackObservable, metadata: EventChangeMetadata) => void;
  segmentChange: (data: AudioSegmentObservable, metadata: EventChangeMetadata) => void;
};

export class AudioTrackObservable extends EventEmitter<AudioTrackEvents> {
  composition: CompositionObservable;

  state: Omit<AudioTrack, "content">;
  segments: Record<string, AudioSegmentObservable> = {};

  constructor(composition: CompositionObservable, state: AudioTrack) {
    super();

    makeAutoObservable(this);
    this.composition = composition;
    this.state = omit(state, "content");
    Object.values(state.content).forEach(segment => this.createSegment(segment));
  }

  steps: AudioTrackDeltaStep[] = [];
  handleDelta(delta: AudioTrackDelta) {
    this.state.version = delta.version;
    for (const step of delta.steps) {
      if (step.data.type === "audio") {
        merge(this.state.attrs, step.data.attrs);
      } else if (step.action === "deleted") {
        delete this.segments[step.data.attrs.id];
      } else if (step.action === "updated" && this.segments[step.data.attrs.id]) {
        merge(this.segments[step.data.attrs.id].state.attrs, step.data.attrs);
      } else {
        this.segments[step.data.attrs.id] = new AudioSegmentObservable(this, step.data);
      }
    }
  }

  sendDelta = throttle(async (delta: AudioTrackDelta) => {
    const index = this.steps.length - 1;
    const response = await client.chapter.audioCompositionChange.mutate({
      type: "audio",
      where: { chapterId: this.composition.chapter.state.id, trackId: this.state.attrs.id },
      data: { action: "updated", change: delta }
    });

    this.steps = this.steps.slice(index);
    if (response.type === "delta") this.handleDelta(response);
  });

  createDeltaStep(step: AudioTrackDeltaStep) {
    this.steps.push(step);
    this.sendDelta({
      type: "delta",
      version: this.state.version,
      clientId: this.composition.clientId,
      steps: this.steps
    });
  }

  update(state: DeepPartial<Pick<AudioTrack, "attrs">>) {
    merge(this.state.attrs, state.attrs, { updatedAt: new Date().toISOString() });

    this.emit("change", this, { action: "updated" });
    this.composition.emit("trackChange", this, { action: "updated" });
    this.createDeltaStep({ type: "audio", action: "updated", data: toJS(this.state) });
  }

  createSegment(data: AudioSegment) {
    const segment = new AudioSegmentObservable(this, data);
    this.segments[data.attrs.id] = segment;
    this.emit("segmentChange", segment, { action: "created" });

    this.createDeltaStep({ type: "audio", action: "created", data: segment.toJSON() });
  }

  updateSegment(id: string, data: DeepPartial<Pick<AudioSegment, "attrs">>) {
    this.segments[id]?.update(data);
  }

  deleteSegment(id: string) {
    const segment = this.segments[id];
    if (!segment) return;

    delete this.segments[id];
    this.emit("segmentChange", segment, { action: "deleted" });
    this.createDeltaStep({ type: "audio", action: "deleted", data: segment.toJSON() });
  }

  toJSON() {
    const content: Record<string, AudioSegment> = {};
    Object.values(this.segments).forEach(segment => {
      content[segment.state.attrs.id] = segment.toJSON();
    });

    return { ...toJS(this.state), content } as AudioTrack;
  }
}

type AudioSegmentEvents = {
  change: (data: AudioSegmentObservable, metadata: EventChangeMetadata) => void;
};

export class AudioSegmentObservable extends EventEmitter<AudioSegmentEvents> {
  track: AudioTrackObservable;
  state: AudioSegment;

  constructor(track: AudioTrackObservable, state: AudioSegment) {
    super();

    makeAutoObservable(this);
    this.track = track;
    this.state = state;
  }

  update(state: DeepPartial<Pick<AudioSegment, "attrs">>) {
    merge(this.state.attrs, state.attrs, { updatedAt: new Date().toISOString() });

    const metadata: EventChangeMetadata = { action: "updated" };
    this.emit("change", this, metadata);
    this.track.emit("segmentChange", this, metadata);
    this.track.composition.emit("segmentChange", this, metadata);

    this.track.createDeltaStep({ type: "audio", action: "updated", data: this.toJSON() });
  }

  toJSON(): AudioSegment {
    return toJS(this.state);
  }
}
