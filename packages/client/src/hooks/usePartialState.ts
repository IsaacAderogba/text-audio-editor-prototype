import type { Dispatch } from "react";

import { useCallback, useState } from "react";

export const usePartialState = <S extends Record<string, any>>(initialState: S) => {
  const [state, setState] = useState(initialState);

  const setPartialState: SetPartialState<S> = useCallback(state => {
    setState(prevState => {
      return {
        ...prevState,
        ...(isSetStatePartialFn(state) ? state(prevState) : state)
      };
    });
  }, []);

  return [state, setPartialState, setState] as const;
};

const isSetStatePartialFn = <S>(fn: SetPartialStateAction<S>): fn is SetStatePartialFunction<S> =>
  typeof fn === "function";

export type SetPartialState<S> = Dispatch<SetPartialStateAction<S>>;
type SetPartialStateAction<S> = ((prevState: S) => Partial<S>) | Partial<S>;
type SetStatePartialFunction<S> = (prevState: S) => Partial<S>;
