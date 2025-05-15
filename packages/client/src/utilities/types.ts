export type Maybe<T> = T | null | undefined;
export type OptionalPick<T, K extends keyof T> = Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = Partial<T> & Required<OptionalPick<T, K>>;

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepPartialBy<T, K extends keyof T> = Omit<T, K> & DeepPartial<Pick<T, K>>;
