import { CompositionEditorState } from "./editor";
import {
  CompositionMetadataState,
  CompositionSegmentState,
  CompositionTrackState
} from "./timeline";

export interface CompositionState {
  editors: Record<string, CompositionEditorState>;
  tracks: Record<string, CompositionTrackState>;
  segments: Record<string, CompositionSegmentState>;
  metadata: CompositionMetadataState;
}

export * from "./editor";
export * from "./timeline";
