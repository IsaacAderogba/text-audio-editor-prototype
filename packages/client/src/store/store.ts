import { InterfaceStore } from "./interface";
import { CacheStore } from "./cache";
import { ModelStore } from "./models/models";

export class Store {
  cache = new CacheStore(this);
  interface = new InterfaceStore(this);
  models = new ModelStore(this);
}

export const store = new Store();
