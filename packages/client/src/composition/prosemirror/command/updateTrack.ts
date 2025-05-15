import { DocumentTrack } from "@taep/core";
import { isArray, mergeWith } from "lodash-es";
import { DeepPartialBy } from "../../../utilities/types";
import { EditorCommand } from "../transform/chain";

export type UpdateTrack<T = EditorCommand> = (
  track: DeepPartialBy<Partial<Omit<DocumentTrack, "type">>, "attrs">
) => T;
export const updateTrack: UpdateTrack = partialTrack => {
  return (state, dispatch) => {
    if (dispatch) {
      if (partialTrack.content) {
        const prevTrack: DocumentTrack = state.doc.toJSON();
        const track: DocumentTrack = mergeWith(prevTrack, partialTrack, (source, target) => {
          if (isArray(source)) return target || source;
        });

        const tr = state.tr.replaceWith(
          0,
          state.doc.content.size,
          state.schema.nodeFromJSON(track)
        );
        dispatch(tr);
      } else if (partialTrack.attrs) {
        const tr = state.tr;
        for (const [key, value] of Object.entries(partialTrack.attrs)) {
          tr.setDocAttribute(key, value);
        }
        dispatch(tr);
      }
    }

    return true;
  };
};
