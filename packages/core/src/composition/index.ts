import { DocumentSegment, DocumentTrack } from "./DocumentTrack";
import { MediaTrack, MediaSegment } from "./MediaTrack";

export type Track = DocumentTrack | MediaTrack;
export type DocumentTrackChange = {
  version: number;
  clientIds: string[];
  changes: object[];
};

export type MediaTrackChange = {
  version: number;
  clientIds: string[];
  changes: object[];
};

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

  changes: Record<string, TrackChange[]>;
}

type TrackChange = DocumentTrackChange | MediaTrackChange;

export * from "./DocumentTrack";
export * from "./MediaTrack";
