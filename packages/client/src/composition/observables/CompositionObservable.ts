import { Chapter, Composition } from "@taep/core";
import { makeAutoObservable, toJS } from "mobx";
import { omit } from "lodash-es";
import { DocumentSegmentObservable, DocumentTrackObservable } from "./DocumentTrackObservable";
import { MediaSegmentObservable, MediaTrackObservable } from "./MediaTrackObservable";

export type TrackObservable = DocumentTrackObservable | MediaTrackObservable;
export type SegmentObservable = DocumentSegmentObservable | MediaSegmentObservable;
export interface CompositionContext {
  chapter: Chapter;
}

interface CompositionEvents {
  contextChange: (context: CompositionContext) => void;

  compositionChange: (composition: CompositionObservable) => void;
  trackChange: (track: TrackObservable) => void;
  segmentChange: (segment: SegmentObservable) => void;
}

export class CompositionObservable {
  context: CompositionContext;
  state: Omit<Composition, "content">;
  tracks: Record<string, TrackObservable> = {};

  private listeners = new Map<string, Set<Function>>();

  constructor(state: Composition, context: CompositionContext) {
    makeAutoObservable(this);

    this.state = omit(state, "content");
    this.context = context;
    Object.values(state.content).forEach(track => {
      if (track.type === "page") {
        this.tracks[track.attrs.id] = new DocumentTrackObservable(this, track);
      } else {
        this.tracks[track.attrs.id] = new MediaTrackObservable(this, track);
      }
    });
  }

  public on = <E extends keyof CompositionEvents>(event: E, cb: CompositionEvents[E]) => {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)?.add(cb);
    return () => {
      this.listeners.get(event)?.delete(cb);
    };
  };

  public emit = <E extends keyof CompositionEvents>(
    event: E,
    ...args: Parameters<CompositionEvents[E]>
  ) => {
    this.listeners.get(event)?.forEach(callback => callback(...args));
  };

  setContext(partialContext: Partial<CompositionContext>) {
    Object.assign(this.context, partialContext);
    this.emit("contextChange", this.context);
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
