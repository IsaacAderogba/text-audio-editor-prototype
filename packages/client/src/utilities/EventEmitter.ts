type KeyOf<T> = Extract<keyof T, string>;

interface Events {
  [key: string]: (...args: any) => void;
}

export type EventsApi<T extends Events> = T;

export class EventEmitter<T extends Events> {
  public listeners = new Map<string, Set<Function>>();

  public on<E extends KeyOf<T>>(event: E, cb: T[E]) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)?.add(cb);
    return () => {
      this.listeners.get(event)?.delete(cb);
    };
  }

  public emit<E extends KeyOf<T>>(event: E, ...args: Parameters<T[E]>) {
    this.listeners.get(event)?.forEach(callback => callback(...args));
  }
}

export interface EventChangeMetadata {
  action: "created" | "updated" | "deleted";
}
