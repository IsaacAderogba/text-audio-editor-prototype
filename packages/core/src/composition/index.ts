import { CompositionDocument } from "./CompositionDocument";
import { CompositionMetadata, CompositionSegment, CompositionTrack } from "./CompositionTimeline";

export interface CompositionEditorState {
  documents: Record<string, CompositionDocument>;
  tracks: Record<string, CompositionTrack>;
  segments: Record<string, CompositionSegment>;
  metadata: CompositionMetadata;
}
