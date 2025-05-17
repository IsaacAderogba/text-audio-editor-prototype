import { CompositionDelta, SegmentAttrs, TrackAttrs } from "./Shared";

export type MediaTrack = VideoTrack | AudioTrack;
export type MediaTrackDelta = VideoTrackDelta | AudioTrackDelta;
export type MediaSegment = VideoSegment | AudioSegment;

export interface VideoTrack {
  type: "video";
  attrs: VideoTrackAttrs;
  content: Record<string, VideoSegment>;
}

export interface VideoTrackAttrs extends TrackAttrs<VideoTrackDelta> {}

export type VideoTrackDelta = CompositionDelta<VideoTrackDeltaStep>;
export type VideoTrackDeltaStep = {
  type: "video";
  action: "created" | "updated" | "deleted";
  data: VideoSegment | Omit<VideoTrack, "content">;
};

export type VideoSegment = FrameSegment;

export interface AudioTrack {
  type: "audio";
  attrs: AudioTrackAttrs;
  content: Record<string, AudioSegment>;
}

export interface AudioTrackAttrs extends TrackAttrs<AudioTrackDelta> {}

export type AudioTrackDelta = CompositionDelta<AudioTrackDeltaStep>;
export type AudioTrackDeltaStep = {
  type: "audio";
  action: "created" | "updated" | "deleted";
  data: AudioSegment | Omit<AudioTrack, "content">;
};

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
