import { Range } from "../state/ranges";
import { EditorCommand } from "./EditorCommand";

export type DeleteRange<T = EditorCommand> = (range: Range) => T;
export const deleteRange: DeleteRange = (range: Range) => {
  return (state, dispatch) => {
    const { from, to } = range;
    if (dispatch) {
      dispatch(state.tr.delete(from, to));
    }

    return true;
  };
};
