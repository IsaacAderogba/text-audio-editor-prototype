import { EditorCommand } from "../transform/chain";

export type ScrollIntoView<T = EditorCommand> = () => T;
export const scrollIntoView: ScrollIntoView = () => (state, dispatch) => {
  if (dispatch) {
    state.tr.scrollIntoView();
  }

  return true;
};
