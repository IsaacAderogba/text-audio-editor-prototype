import { Transaction } from "prosemirror-state";
import { EditorCommand } from "./EditorCommand";

export type ReplaceRangeWith<T = EditorCommand> = (
  ...args: Parameters<Transaction["replaceRangeWith"]>
) => T;
export const replaceRangeWith: ReplaceRangeWith = (...args) => {
  return (state, dispatch) => {
    if (dispatch) {
      dispatch(state.tr.replaceRangeWith(...args));
    }

    return true;
  };
};
