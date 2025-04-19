export type CompositionTrackState =
  | CompositionEditorTrackState
  | CompositionVideoTrackState
  | CompositionAudioTrackState;

export interface CompositionEditorTrackState extends TrackState {
  type: "editor";
  editor: {};
}

export interface CompositionVideoTrackState extends TrackState {
  type: "video";
  video: {};
}

export interface CompositionAudioTrackState extends TrackState {
  type: "audio";
  audio: {};
}

interface TrackState {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompositionMetadataState {
  fps: number;
  width: number;
  height: number;
}

export type CompositionSegmentState =
  | CompositionEditorSegmentState
  | CompositionVideoSegmentState
  | CompositionAudioSegmentState;

export interface CompositionEditorSegmentState extends SegmentState {
  type: "editor";
  editor: {
    inlineBlockId: string;
  };
}

export interface CompositionVideoSegmentState extends SegmentState {
  type: "video";
  video: {
    src: string;
  };
}

export interface CompositionAudioSegmentState extends SegmentState {
  type: "audio";
  audio: {
    src: string;
  };
}

interface SegmentState {
  id: string;
  trackId: string;
  from: number;
  duration: number;
  playbackRate: number;
  createdAt: string;
  updatedAt: string;
}
