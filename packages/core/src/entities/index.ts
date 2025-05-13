import { Composition } from "../composition";
import { DeepPartial } from "../utilities/types";

export type EntitiesAPI = {
  [K in keyof EntityRecord]: EntityAPI<EntityRecord[K]>;
};

export type EntityRecord = {
  projects: ProjectEntity;
  chapters: ChapterEntity;
};

export type EntityAPI<T extends Entity> = {
  read: (id: string) => Promise<T | null>;
  list: () => Promise<T[]>;
  upsertMany: (record: T[]) => Promise<T[]>;
  create: (record: T) => Promise<T>;
  update: (id: string, record: DeepPartial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
};

export type EntitySnapshot<T extends Entity = Entity> = {
  action: "created" | "updated" | "deleted";
  data: T;
};

export type Entity = ProjectEntity | ChapterEntity;

export interface ProjectEntity {
  id: string;
  type: "project";

  createdAt: string;
  updatedAt: string;
}

export interface ChapterEntity {
  id: string;
  type: "chapter";
  projectId: ProjectEntity["id"];

  composition: Composition;

  createdAt: string;
  updatedAt: string;
}
