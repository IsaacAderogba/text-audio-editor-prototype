export type CompositionTrack =
  | CompositionEditorTrack
  | CompositionVideoTrack
  | CompositionAudioTrack;

export interface CompositionEditorTrack extends Track {
  type: "editor";
  editor: {};
}

export interface CompositionVideoTrack extends Track {
  type: "video";
  video: {};
}

export interface CompositionAudioTrack extends Track {
  type: "audio";
  audio: {};
}

interface Track {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompositionMetadata {
  fps: number;
  width: number;
  height: number;
}

export type CompositionSegment =
  | CompositionEditorSegment
  | CompositionVideoSegment
  | CompositionAudioSegment;

export interface CompositionEditorSegment extends Segment {
  type: "editor";
  editor: {
    inlineBlockId: string;
  };
}

export interface CompositionVideoSegment extends Segment {
  type: "video";
  video: {
    src: string;
  };
}

export interface CompositionAudioSegment extends Segment {
  type: "audio";
  audio: {
    src: string;
  };
}

interface Segment {
  id: string;
  trackId: string;
  from: number;
  duration: number;
  playbackRate: number;
  createdAt: string;
  updatedAt: string;
}
