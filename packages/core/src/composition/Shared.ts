export interface CompositionDelta<T> {
  type: "delta";
  version: number;
  clientId: string;
  steps: T[];
}

export interface TrackAttrs {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentAttrs {
  id: string;
  trackId: string;
  offset: number;
  duration: number;
  playbackRate: number;
  createdAt: string;
  updatedAt: string;
}
