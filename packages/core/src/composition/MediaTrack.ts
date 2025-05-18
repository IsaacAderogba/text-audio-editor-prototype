import { CompositionDelta, SegmentAttrs, TrackAttrs } from "./Shared";

export type MediaTrack = VideoTrack | AudioTrack;
export type MediaTrackDelta = VideoTrackDelta | AudioTrackDelta;
export type MediaTrackDeltaStep = VideoTrackDeltaStep | AudioTrackDeltaStep;
export type MediaSegment = VideoSegment | AudioSegment;

export interface VideoTrack {
  type: "video";
  attrs: VideoTrackAttrs;
  content: Record<string, VideoSegment>;
}

export interface VideoTrackAttrs extends TrackAttrs<VideoTrackDelta> {}

export type VideoTrackDelta = CompositionDelta<VideoTrackDeltaStep>;
export type VideoTrackDeltaStep =
  | VideoTrackUpdatedTrackStep
  | VideoTrackCreatedSegmentStep
  | VideoTrackUpdatedSegmentStep
  | VideoTrackDeletedSegmentStep;

export type VideoTrackUpdatedTrackStep = {
  type: "video";
  action: "updated";
  data: Omit<VideoTrack, "content">;
};
export type VideoTrackCreatedSegmentStep = { type: "video"; action: "created"; data: VideoSegment };
export type VideoTrackUpdatedSegmentStep = { type: "video"; action: "updated"; data: VideoSegment };
export type VideoTrackDeletedSegmentStep = { type: "video"; action: "deleted"; data: VideoSegment };

export type VideoSegment = FrameSegment;

export interface AudioTrack {
  type: "audio";
  attrs: AudioTrackAttrs;
  content: Record<string, AudioSegment>;
}

export interface AudioTrackAttrs extends TrackAttrs<AudioTrackDelta> {}

export type AudioTrackDelta = CompositionDelta<AudioTrackDeltaStep>;
export type AudioTrackDeltaStep =
  | AudioTrackUpdatedTrackStep
  | AudioTrackCreatedSegmentStep
  | AudioTrackUpdatedSegmentStep
  | AudioTrackDeletedSegmentStep;

export type AudioTrackUpdatedTrackStep = {
  type: "audio";
  action: "updated";
  data: Omit<AudioTrack, "content">;
};
export type AudioTrackCreatedSegmentStep = { type: "audio"; action: "created"; data: AudioSegment };
export type AudioTrackUpdatedSegmentStep = { type: "audio"; action: "updated"; data: AudioSegment };
export type AudioTrackDeletedSegmentStep = { type: "audio"; action: "deleted"; data: AudioSegment };

export type AudioSegment = SampleSegment;

export interface FrameSegment {
  type: "frame";
  attrs: FrameSegmentAttrs;
}

export interface FrameSegmentAttrs extends SegmentAttrs {
  src: string;
}

export interface SampleSegment {
  type: "sample";
  attrs: SampleSegmentAttrs;
}

export interface SampleSegmentAttrs extends SegmentAttrs {
  src: string;
}
