import { makeAutoObservable } from "mobx";

import { Chapter, Project } from "@taep/core";
import { merge } from "lodash-es";
import { EventChangeMetadata, EventEmitter } from "../utilities/EventEmitter";
import { DeepPartial } from "../utilities/types";
import type { StoreObservable } from "./store";

type EntityEvents<T> = {
  change: (data: EntityObservable<T>, metadata: EventChangeMetadata) => void;
};

class EntityObservable<T> extends EventEmitter<EntityEvents<T>> {
  store: EntityStoreObservable<T>;
  state: T;

  constructor(store: EntityStoreObservable<T>, state: T) {
    super();

    makeAutoObservable(this);
    this.store = store;
    this.state = state;
  }

  update(state: DeepPartial<T>) {
    merge(this.state, state);

    this.emit("change", this, { action: "updated" });
    this.store.emit("entityChange", this, { action: "updated" });
  }
}

type EntityStoreEvents<T> = {
  change: (data: EntityStoreObservable<T>, metadata: EventChangeMetadata) => void;
  entityChange: (data: EntityObservable<T>, metadata: EventChangeMetadata) => void;
};

class EntityStoreObservable<T> extends EventEmitter<EntityStoreEvents<T>> {
  store: StoreObservable;
  state: Record<string, EntityObservable<T>> = {};

  constructor(store: StoreObservable) {
    super();

    makeAutoObservable(this);
    this.store = store;
  }

  delete(id: string) {
    const entity = this.state[id];
    if (entity) {
      delete this.state[id];
      entity.listeners.clear();
      this.emit("entityChange", entity, { action: "deleted" });
    }
  }

  upsert(id: string, entity: T) {
    const observable = this.state[id];
    if (observable) {
      observable.update(entity);
    } else {
      this.state[id] = new EntityObservable(this, entity);
      this.emit("entityChange", this.state[id], { action: "created" });
    }
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
