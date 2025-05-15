import { DocumentSegment, getAttrs, NodeGroup } from "@taep/core";
import { isArray, mergeWith } from "lodash-es";
import { DeepPartialBy } from "../../../utilities/types";
import { findNode } from "../state/nodes";
import { EditorCommand } from "../transform/chain";

export type UpdateSegment<T = EditorCommand> = (
  id: string,
  segment: DeepPartialBy<Partial<Omit<DocumentSegment, "type">>, "attrs">
) => T;
export const updateSegment: UpdateSegment = (id, partialSegment) => {
  return (state, dispatch) => {
    const found = findNode(state.doc, {
      nodeFilter: node => {
        if (!node.type.isInGroup(NodeGroup.segment)) return false;
        return getAttrs<DocumentSegment>(node).id === id;
      }
    });

    if (found && dispatch) {
      const { node, pos } = found;
      if (partialSegment.content) {
        const prevSegment: DocumentSegment = node.toJSON();
        const segment: DocumentSegment = mergeWith(
          prevSegment,
          partialSegment,
          (source, target) => {
            if (isArray(source)) return target || source;
          }
        );

        const tr = state.tr.replaceWith(
          pos,
          pos + node.nodeSize,
          state.schema.nodeFromJSON(segment)
        );
        dispatch(tr);
      } else if (partialSegment.attrs) {
        const tr = state.tr;
        for (const [key, value] of Object.entries(partialSegment.attrs)) {
          tr.setNodeAttribute(pos, key, value);
        }
        dispatch(tr);
      }
    }

    return Boolean(found);
  };
};
