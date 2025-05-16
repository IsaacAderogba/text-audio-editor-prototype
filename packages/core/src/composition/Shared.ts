export interface CompositionDelta<T> {
  type: "delta";
  version: number;
  clientId: string;
  steps: T[];
}

export interface TrackAttrs<T> {
  id: string;
  latestVersion: number;
  deltas: T[];
  createdAt: string;
  updatedAt: string;
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
