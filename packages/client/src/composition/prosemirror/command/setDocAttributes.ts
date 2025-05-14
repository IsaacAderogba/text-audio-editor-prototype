import { EditorCommand } from "./EditorCommand";

export type SetDocAttributes<T = EditorCommand> = (attrs: Record<string, unknown>) => T;
export const setDocAttributes: SetDocAttributes = attrs => {
  return (state, dispatch) => {
    if (dispatch) {
      const tr = state.tr;
      for (const [key, value] of Object.entries(attrs)) {
        tr.setDocAttribute(key, value);
      }
      dispatch(tr);
    }

    return true;
  };
};
