import { CompositionState } from "../composition";

export interface ProjectEntity {
  id: string;

  createdAt: string;
  updatedAt: string;
}

export interface ChapterEntity {
  id: string;
  projectId: ProjectEntity["id"];

  compositionState: CompositionState;

  createdAt: string;
  updatedAt: string;
}
