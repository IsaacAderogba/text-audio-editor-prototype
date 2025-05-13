import { TextSelection } from "prosemirror-state";
import { EditorCommand } from "./EditorCommand";
import { Annotation, setAttrs } from "@taep/core";
import { markApplies } from "../state/marks";

export type ToggleMark<T = EditorCommand> = (mark: Annotation) => T;
export const toggleMark: ToggleMark = ({ type, attrs }: Annotation) => {
  return (state, dispatch) => {
    const markType = state.schema.marks[type];

    const { empty, $cursor, ranges } = state.selection as TextSelection;
    if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) return false;
    if (dispatch) {
      if ($cursor) {
        if (markType.isInSet(state.storedMarks || $cursor.marks())) {
          dispatch(state.tr.removeStoredMark(markType));
        } else {
          dispatch(state.tr.addStoredMark(markType.create(setAttrs(attrs))));
        }
      } else {
        let has = false;
        const tr = state.tr;

        for (let i = 0; !has && i < ranges.length; i++) {
          const { $from, $to } = ranges[i];
          has = state.doc.rangeHasMark($from.pos, $to.pos, markType);
        }
        for (let i = 0; i < ranges.length; i++) {
          const { $from, $to } = ranges[i];
          if (has) {
            tr.removeMark($from.pos, $to.pos, markType);
          } else {
            let from = $from.pos;
            let to = $to.pos;
            const start = $from.nodeAfter;
            const end = $to.nodeBefore;

            const spaceStart = start && start.isText ? /^\s*/.exec(start.text!)![0].length : 0;
            const spaceEnd = end && end.isText ? /\s*$/.exec(end.text!)![0].length : 0;
            if (from + spaceStart < to) {
              from += spaceStart;
              to -= spaceEnd;
            }
            tr.addMark(from, to, markType.create(setAttrs(attrs)));
          }
        }
        dispatch(tr.scrollIntoView());
      }
    }
    return true;
  };
};
