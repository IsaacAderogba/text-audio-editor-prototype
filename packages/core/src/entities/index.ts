import { CompositionEditorState } from "../composition";

export interface ProjectEntity {
  id: string;

  createdAt: string;
  updatedAt: string;
}

export interface ChapterEntity {
  id: string;
  projectId: ProjectEntity["id"];

  editorState: CompositionEditorState;

  createdAt: string;
  updatedAt: string;
}
