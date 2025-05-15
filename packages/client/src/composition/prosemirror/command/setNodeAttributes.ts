import { EditorCommand } from "../transform/chain";

export type SetNodeAttributes<T = EditorCommand> = (
  pos: number,
  attrs: Record<string, unknown>
) => T;
export const setNodeAttributes: SetNodeAttributes = (pos, attrs) => {
  return (state, dispatch) => {
    if (dispatch) {
      const tr = state.tr;
      for (const [key, value] of Object.entries(attrs)) {
        tr.setNodeAttribute(pos, key, value);
      }
      dispatch(tr);
    }

    return true;
  };
};
