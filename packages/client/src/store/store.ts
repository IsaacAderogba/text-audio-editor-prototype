import { InterfaceStoreObservable } from "./interface";
import { CacheStoreObservable } from "./cache";
import { EntitiesStoreObservable } from "./entities";

export class StoreObservable {
  cache = new CacheStoreObservable(this);
  interface = new InterfaceStoreObservable(this);
  models = new EntitiesStoreObservable(this);
}

export const storeObservable = new StoreObservable();
