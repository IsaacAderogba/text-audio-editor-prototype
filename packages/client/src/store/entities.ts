import { makeAutoObservable } from "mobx";

import type { StoreObservable } from "./store";
import { ChapterEntity, ProjectEntity } from "@teap/core";
import { DeepPartial } from "../utilities/types";
import { merge } from "lodash-es";

class EntityObservable<T> {
  state: T;

  constructor(state: T) {
    makeAutoObservable(this);
    this.state = state;
  }

  setState(state: DeepPartial<T>) {
    merge(this.state, state);
  }
}

class EntityStoreObservable<T> {
  store: StoreObservable;
  state: Record<string, EntityObservable<T>> = {};

  constructor(store: StoreObservable) {
    makeAutoObservable(this);
    this.store = store;
  }

  remove(id: string) {
    delete this.state[id];
  }

  set(id: string, Entity: T) {
    this.state[id] = new EntityObservable(Entity);
  }
}

export class EntitiesStoreObservable {
  projects: EntityStoreObservable<ProjectEntity>;
  chapters: EntityStoreObservable<ChapterEntity>;

  constructor(store: StoreObservable) {
    makeAutoObservable(this);

    this.projects = new EntityStoreObservable(store);
    this.chapters = new EntityStoreObservable(store);
  }
}
