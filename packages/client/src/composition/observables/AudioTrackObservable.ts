import { AudioSegment, AudioTrack, CompositionMessage } from "@taep/core";
import { merge, omit } from "lodash-es";
import { makeAutoObservable, toJS } from "mobx";
import { EventChangeMetadata, EventEmitter } from "../../utilities/EventEmitter";
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

  handleUpdateMessage(message: CompositionMessage) {}

  update(state: DeepPartial<Pick<AudioTrack, "attrs">>) {
    merge(this.state.attrs, state.attrs, { updatedAt: new Date().toISOString() });

    this.emit("change", this, { action: "updated" });
    this.composition.emit("trackChange", this, { action: "updated" });
  }

  createSegment(segment: AudioSegment) {
    this.segments[segment.attrs.id] = new AudioSegmentObservable(this, segment);
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
  }

  toJSON(): AudioSegment {
    return toJS(this.state);
  }
}
