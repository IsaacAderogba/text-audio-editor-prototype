import { Composition } from "../composition";
import { DeepPartial } from "../utilities/types";

export type EntitiesAPI = {
  [K in keyof EntityRecord]: EntityAPI<EntityRecord[K]>;
};

export type EntityRecord = {
  projects: Project;
  chapters: Chapter;
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

export type Entity = Project | Chapter;

export interface Project {
  id: string;
  type: "project";

  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  type: "chapter";
  projectId: Project["id"];

  composition: Composition;

  createdAt: string;
  updatedAt: string;
}
