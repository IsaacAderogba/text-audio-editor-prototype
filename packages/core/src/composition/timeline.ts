export type CompositionTrackState = CompositionVideoTrackState | CompositionAudioTrackState;

export interface CompositionVideoTrackState {
  type: "video";
  attrs: CompositionVideoTrackAttrs;
  content: Record<string, CompositionFrameSegmentState>;
}

export interface CompositionVideoTrackAttrs extends TrackAttrs {}

export interface CompositionAudioTrackState {
  type: "audio";
  attrs: CompositionAudioTrackAttrs;
  content: Record<string, CompositionSampleSegmentState>;
}

export interface CompositionAudioTrackAttrs extends TrackAttrs {}

interface TrackAttrs {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompositionMetadataState {
  fps: number;
  width: number;
  height: number;
}

export type CompositionSegmentState = CompositionFrameSegmentState | CompositionSampleSegmentState;

export interface CompositionFrameSegmentState {
  type: "frame";
  attrs: CompositionFrameSegmentAttrs;
}

export interface CompositionFrameSegmentAttrs extends SegmentAttrs {
  src: string;
}

export interface CompositionSampleSegmentState {
  type: "sample";
  attrs: CompositionSampleSegmentAttrs;
}

export interface CompositionSampleSegmentAttrs extends SegmentAttrs {
  src: string;
}

export interface SegmentAttrs {
  id: string;
  trackId: string;
  from: number;
  duration: number;
  playbackRate: number;
  createdAt: string;
  updatedAt: string;
}
