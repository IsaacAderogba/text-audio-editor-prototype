import type { LegacyRef, MutableRefObject, RefCallback } from "react";

import { useEffect, useMemo, useRef } from "react";

export function useCallbackRef<T extends (...args: any[]) => any>(callback: T | undefined): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useMemo(() => ((...args) => callbackRef.current?.(...args)) as T, []);
}

export const useValueRef = <T>(data: T) => {
  const ref = useRef<T>(data);
  ref.current = data;

  return ref;
};

export function mergeRefs<T = any>(
  refs: Array<LegacyRef<T> | MutableRefObject<T>>
): RefCallback<T> {
  return value => {
    refs.forEach(ref => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as MutableRefObject<T | null>).current = value;
      }
    });
  };
}
