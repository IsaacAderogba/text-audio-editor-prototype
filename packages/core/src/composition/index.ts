import { DocumentSegment, DocumentTrack } from "./DocumentTrack";
import { MediaTrack, MediaSegment } from "./MediaTrack";

export type Track = DocumentTrack | MediaTrack;
export type TrackChange = DocumentTrackChange | MediaTrackChange;
export type DocumentTrackChange = {
  acknowledged: boolean;
  version: number;
  clientIds: string[];
  changes: object[];
};

export type MediaTrackChange = {
  acknowledged: boolean;
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

export * from "./DocumentTrack";
export * from "./MediaTrack";
