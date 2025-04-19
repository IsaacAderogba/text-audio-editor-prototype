import { makeAutoObservable } from "mobx";

import type { StoreObservable } from "./store";
import type { InterfaceThemePreference } from "./interface";

interface CacheState {
  interfaceThemePreference: InterfaceThemePreference;
}

export class CacheStoreObservable {
  store: StoreObservable;
  state: Partial<CacheState>;

  constructor(store: StoreObservable) {
    makeAutoObservable(this);

    this.store = store;
    this.state = this.initializeState();
  }

  private initializeState() {
    const state: Partial<CacheState> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i) as keyof CacheState;

      try {
        const item = window.localStorage.getItem(key);
        state[key] = item ? JSON.parse(item) : null;
      } catch {
        window.localStorage.removeItem(key);
      }
    }

    return state;
  }

  set<T extends keyof CacheState>(key: T, value: CacheState[T]) {
    this.state[key] = value;
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  remove<T extends keyof CacheState>(key: T): void {
    delete this.state[key];
    window.localStorage.removeItem(key);
  }
}
