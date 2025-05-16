import { makeAutoObservable } from "mobx";

import { Chapter, Project } from "@taep/core";
import { merge } from "lodash-es";
import { EventEmitter } from "../utilities/EventEmitter";
import { DeepPartial } from "../utilities/types";
import type { StoreObservable } from "./store";

type EntityEvents<T> = {
  update: (data: EntityObservable<T>) => void;
};
class EntityObservable<T> extends EventEmitter<EntityEvents<T>> {
  state: T;

  constructor(state: T) {
    super();

    makeAutoObservable(this);
    this.state = state;
  }

  update(state: DeepPartial<T>) {
    merge(this.state, state);

    this.emit("update", this);
  }
}

class EntityStoreObservable<T> {
  store: StoreObservable;
  state: Record<string, EntityObservable<T>> = {};

  constructor(store: StoreObservable) {
    makeAutoObservable(this);
    this.store = store;
  }

  delete(id: string) {
    const entity = this.state[id];
    if (entity) {
      delete this.state[id];
      entity.listeners.clear();
    }
  }

  upsert(id: string, Entity: T) {
    this.state[id] = new EntityObservable(Entity);
  }
}

export type ProjectObservable = EntityObservable<Project>;
export type ChapterObservable = EntityObservable<Chapter>;

export class EntitiesStoreObservable {
  projects: EntityStoreObservable<Project>;
  chapters: EntityStoreObservable<Chapter>;

  constructor(store: StoreObservable) {
    makeAutoObservable(this);

    this.projects = new EntityStoreObservable(store);
    this.chapters = new EntityStoreObservable(store);
  }
}
