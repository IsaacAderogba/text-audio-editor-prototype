import { CompositionEditorState } from "./editor";
import { CompositionMetadataState, CompositionTrackState } from "./timeline";

export interface CompositionState {
  editors: Record<string, CompositionEditorState>;
  tracks: Record<string, CompositionTrackState>;
  metadata: CompositionMetadataState;
}

export * from "./editor";
export * from "./timeline";
