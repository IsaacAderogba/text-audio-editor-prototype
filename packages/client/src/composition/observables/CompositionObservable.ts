import { Composition } from "@taep/core";
import { merge, omit } from "lodash-es";
import { makeAutoObservable, toJS } from "mobx";
import { ChapterObservable } from "../../store/entities";
import { EventChangeMetadata, EventEmitter } from "../../utilities/EventEmitter";
import { DeepPartial } from "../../utilities/types";
import { PageSegmentObservable, PageTrackObservable } from "./DocumentTrackObservable";
import { VideoSegmentObservable, VideoTrackObservable } from "./VideoTrackObservable";
import { AudioSegmentObservable, AudioTrackObservable } from "./AudioTrackObservable";

export type TrackObservable = PageTrackObservable | VideoTrackObservable | AudioTrackObservable;
export type SegmentObservable =
  | PageSegmentObservable
  | VideoSegmentObservable
  | AudioSegmentObservable;

export type CompositionEvents = {
  change: (data: CompositionObservable, metadata: EventChangeMetadata) => void;
  trackChange: (data: TrackObservable, metadata: EventChangeMetadata) => void;
  segmentChange: (data: SegmentObservable, metadata: EventChangeMetadata) => void;
};
export class CompositionObservable extends EventEmitter<CompositionEvents> {
  chapter: ChapterObservable;
  state: Omit<Composition, "content">;
  tracks: Record<string, TrackObservable> = {};

  constructor(chapter: ChapterObservable) {
    super();

    makeAutoObservable(this);
    this.chapter = chapter;
    this.state = omit(this.chapter.state.composition, "content");
    Object.values(this.chapter.state.composition.content).forEach(track => {
      if (track.type === "page") {
        this.tracks[track.attrs.id] = new PageTrackObservable(this, track);
      } else if (track.type === "video") {
        this.tracks[track.attrs.id] = new VideoTrackObservable(this, track);
      } else {
        this.tracks[track.attrs.id] = new AudioTrackObservable(this, track);
      }
    });
  }

  update(state: DeepPartial<Pick<Composition, "attrs">>) {
    merge(this.state.attrs, state.attrs);

    this.emit("change", this, { action: "updated" });
  }

  toJSON(): Composition {
    const content: Composition["content"] = {};
    Object.values(this.tracks).forEach(track => {
      const data = track.toJSON();
      content[data.attrs.id] = data;
    });

    return { ...toJS(this.state), content };
  }
}
