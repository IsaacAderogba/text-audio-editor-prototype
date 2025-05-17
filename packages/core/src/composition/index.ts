import { PageSegment, PageTrack } from "./DocumentTrack";
import { AudioSegment, AudioTrack, VideoSegment, VideoTrack } from "./MediaTrack";

export type Track = PageTrack | VideoTrack | AudioTrack;
export type Segment = PageSegment | VideoSegment | AudioSegment;
export interface Composition {
  type: "composition";
  attrs: CompositionAttrs;
  content: Record<string, Track>;
}

export interface CompositionAttrs {
  fps: number;
  width: number;
  height: number;
}

export * from "./DocumentTrack";
export * from "./MediaTrack";
