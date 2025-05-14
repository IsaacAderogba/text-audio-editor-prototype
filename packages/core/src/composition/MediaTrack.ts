export type MediaTrack = VideoTrack | AudioTrack;

export interface VideoTrack {
  type: "video";
  attrs: VideoTrackAttrs;
  content: Record<string, FrameSegment>;
}

export interface VideoTrackAttrs extends MediaTrackAttrs {}

export interface AudioTrack {
  type: "audio";
  attrs: AudioTrackAttrs;
  content: Record<string, SampleSegment>;
}

export interface AudioTrackAttrs extends MediaTrackAttrs {}

interface MediaTrackAttrs {
  id: string;
  latestVersion: number;
  createdAt: string;
  updatedAt: string;
}

export type MediaSegment = FrameSegment | SampleSegment;

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

export interface SegmentAttrs {
  id: string;
  trackId: string;
  from: number;
  duration: number;
  playbackRate: number;
  createdAt: string;
  updatedAt: string;
}
