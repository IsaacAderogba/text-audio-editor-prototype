import { DocumentSegment, DocumentTrack } from "./DocumentTrack";
import { Metadata, MediaTrack, MediaSegment } from "./MediaTrack";

export type Track = DocumentTrack | MediaTrack;
export type Segment = MediaSegment | DocumentSegment;
export interface CompositionState {
  tracks: Record<string, Track>;
  metadata: Metadata;
}

export * from "./DocumentTrack";
export * from "./MediaTrack";
