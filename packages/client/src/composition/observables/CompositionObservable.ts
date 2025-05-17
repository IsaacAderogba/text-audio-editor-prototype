import { Composition, Track } from "@taep/core";
import { merge, omit } from "lodash-es";
import { makeAutoObservable, toJS } from "mobx";
import { ChapterObservable } from "../../store/entities";
import { EventChangeMetadata, EventEmitter } from "../../utilities/EventEmitter";
import { client } from "../../utilities/trpc";
import { DeepPartial } from "../../utilities/types";
import { AudioSegmentObservable, AudioTrackObservable } from "./AudioTrackObservable";
import { PageSegmentObservable, PageTrackObservable } from "./PageTrackObservable";
import { VideoSegmentObservable, VideoTrackObservable } from "./VideoTrackObservable";
import { v4 } from "uuid";

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
  clientId = v4();
  chapter: ChapterObservable;
  state: Omit<Composition, "content">;
  tracks: Record<string, TrackObservable> = {};

  constructor(chapter: ChapterObservable) {
    super();

    makeAutoObservable(this);
    this.chapter = chapter;
    this.state = omit(this.chapter.state.composition, "content");
    Object.values(this.chapter.state.composition.content).forEach(track => {
      this.createTrack(track);
    });
  }

  update(state: DeepPartial<Pick<Composition, "attrs">>) {
    merge(this.state.attrs, state.attrs);

    this.emit("change", this, { action: "updated" });
  }

  createTrack(track: Track) {
    if (track.type === "page") {
      this.tracks[track.attrs.id] = new PageTrackObservable(this, track);
    } else if (track.type === "video") {
      this.tracks[track.attrs.id] = new VideoTrackObservable(this, track);
    } else {
      this.tracks[track.attrs.id] = new AudioTrackObservable(this, track);
    }

    this.emit("trackChange", this.tracks[track.attrs.id], { action: "created" });
  }

  deleteTrack(id: string) {
    const track = this.tracks[id];
    if (track) {
      delete this.tracks[id];
      this.emit("trackChange", track, { action: "deleted" });
    }
  }

  subscribeToRemoteChanges() {
    return client.chapter.onCompositionChange.subscribe(
      { where: { chapterId: this.chapter.state.id } },
      {
        onData: message => {
          if (message.data.action === "created") {
            this.createTrack(message.data.change);
          } else if (message.data.action === "deleted") {
            this.deleteTrack(message.data.change.attrs.id);
          } else {
            const track = this.tracks[message.where.trackId];
            if (track && track) track.handleUpdateDelta(message.data.change);
          }
        },
        onError: err => console.error("trackMessage error", err)
      }
    );
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
