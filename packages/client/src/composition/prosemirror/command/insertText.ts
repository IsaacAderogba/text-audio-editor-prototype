import { Transaction } from "prosemirror-state";
import { EditorCommand } from "../transform/chain";

export type InsertText<T = EditorCommand> = (...args: Parameters<Transaction["insertText"]>) => T;
export const insertText: InsertText = (...args) => {
  return (state, dispatch) => {
    if (dispatch) {
      dispatch(state.tr.insertText(...args));
    }

    return true;
  };
};
