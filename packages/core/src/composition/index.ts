import { DocumentSegment, DocumentTrack, DocumentTrackChange } from "./DocumentTrack";
import { MediaTrack, MediaSegment, MediaTrackChange } from "./MediaTrack";

export type Track = DocumentTrack | MediaTrack;
export type TrackChange = DocumentTrackChange | MediaTrackChange;

export type Segment = MediaSegment | DocumentSegment;
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
