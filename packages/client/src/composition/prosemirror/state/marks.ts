import { Mark, MarkType, Node } from "prosemirror-model";
import { EditorState, SelectionRange } from "prosemirror-state";
import { isMatch } from "lodash-es";
import { RangeMark } from "./ranges";
import { Annotation } from "@taep/core";

export function isMarkActive(state: EditorState, annotation: Annotation): boolean {
  const { type, attrs } = annotation;
  const { empty, ranges } = state.selection;
  const markType = state.schema.marks[type];

  if (empty) {
    return !!(state.storedMarks || state.selection.$from.marks())
      .filter(mark => {
        return markType.name === mark.type.name;
      })
      .find(mark => isMatch(mark.attrs, attrs));
  }

  let selectionRange = 0;
  const markRanges: RangeMark[] = [];

  ranges.forEach(({ $from, $to }) => {
    const from = $from.pos;
    const to = $to.pos;

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isText && !node.marks.length) {
        return;
      }

      const relativeFrom = Math.max(from, pos);
      const relativeTo = Math.min(to, pos + node.nodeSize);
      const range = relativeTo - relativeFrom;

      selectionRange += range;

      markRanges.push(
        ...node.marks.map(mark => ({
          mark,
          from: relativeFrom,
          to: relativeTo
        }))
      );
    });
  });

  if (selectionRange === 0) {
    return false;
  }

  // calculate range of matched mark
  const matchedRange = markRanges
    .filter(markRange => {
      return markType.name === markRange.mark.type.name;
    })
    .filter(markRange => isMatch(markRange.mark.attrs, attrs))
    .reduce((sum, markRange) => sum + markRange.to - markRange.from, 0);

  // calculate range of marks that excludes the searched mark
  // for example `code` doesn’t allow any other marks
  const excludedRange = markRanges
    .filter(markRange => {
      return markRange.mark.type !== markType && markRange.mark.type.excludes(markType);
    })
    .reduce((sum, markRange) => sum + markRange.to - markRange.from, 0);

  // we only include the result of `excludedRange`
  // if there is a match at all
  const range = matchedRange > 0 ? matchedRange + excludedRange : matchedRange;

  return range >= selectionRange;
}

export function marksBetween(start: number, end: number, state: EditorState) {
  let marks: { start: number; end: number; mark: Mark }[] = [];

  state.doc.nodesBetween(start, end, (node, pos) => {
    marks = [
      ...marks,
      ...node.marks.map(mark => ({
        start: pos,
        end: pos + node.nodeSize,
        mark
      }))
    ];
  });

  return marks;
}

export function markApplies(doc: Node, ranges: readonly SelectionRange[], type: MarkType) {
  for (let i = 0; i < ranges.length; i++) {
    const { $from, $to } = ranges[i];
    let can = $from.depth == 0 ? doc.type.allowsMarkType(type) : false;
    doc.nodesBetween($from.pos, $to.pos, node => {
      if (can) return false;
      can = node.inlineContent && node.type.allowsMarkType(type);
    });
    if (can) return true;
  }
  return false;
}
