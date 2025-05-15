import { Block, getAttrs, NodeGroup } from "@taep/core";
import { isArray, mergeWith } from "lodash-es";
import { DeepPartialBy } from "../../../utilities/types";
import { findNode } from "../state/nodes";
import { EditorCommand } from "../transform/chain";

export type UpdateBlock<T = EditorCommand> = (
  id: string,
  block: DeepPartialBy<Partial<Omit<Block, "type">>, "attrs">
) => T;
export const updateBlock: UpdateBlock = (id, partialBlock) => {
  return (state, dispatch) => {
    const found = findNode(state.doc, {
      nodeFilter: node => {
        if (!node.type.isInGroup(NodeGroup.block)) return false;
        return getAttrs<Block>(node).id === id;
      }
    });

    if (found && dispatch) {
      const { node, pos } = found;
      if (partialBlock.content) {
        const prevBlock: Block = node.toJSON();
        const block: Block = mergeWith(prevBlock, partialBlock, (source, target) => {
          if (isArray(source)) return target || source;
        });

        const tr = state.tr.replaceWith(pos, pos + node.nodeSize, state.schema.nodeFromJSON(block));
        dispatch(tr);
      } else if (partialBlock.attrs) {
        const tr = state.tr;
        for (const [key, value] of Object.entries(partialBlock.attrs)) {
          tr.setNodeAttribute(pos, key, value);
        }
        dispatch(tr);
      }
    }

    return Boolean(found);
  };
};
