import { v4 } from "uuid";
import { Plugin } from "prosemirror-state";
import { Extension } from "../Extension";
import { ChainableTransaction } from "../../prosemirror/transform/transaction";
import { findChangedNodes } from "../../prosemirror/state/nodes";
import { Block, DocumentSegment, DocumentTrack, getAttrs, NodeGroup } from "@taep/core";

export class AttrsExtension extends Extension {
  name = "attrs";

  initializePlugins = () => {
    return {
      attrs: new Plugin({
        filterTransaction: tr => {
          return !tr.docChanged;
        },
        appendTransaction(transactions, _prevState, newState) {
          const tr = new ChainableTransaction(newState);
          const date = new Date().toISOString();

          for (const transaction of transactions) {
            const groups = [NodeGroup.block, NodeGroup.segment];
            const nodes = findChangedNodes(transaction, {
              nodeFilter: node => groups.some(group => node.type.isInGroup(group))
            });

            for (const { pos, node } of nodes) {
              tr.chain.setNodeAttribute(pos, "updatedAt", date);
              if (!getAttrs<Block | DocumentSegment>(node).id) {
                tr.chain.setNodeAttribute(pos, "id", v4());
                tr.chain.setNodeAttribute(pos, "createdAt", date);
              }
            }
          }

          if (!getAttrs<DocumentTrack>(newState.doc).id) {
            tr.chain.setDocAttribute("id", v4());
            tr.chain.setDocAttribute("createdAt", date);
            tr.chain.setDocAttribute("updatedAt", date);
          }

          return tr.chainedTransaction;
        }
      })
    };
  };
}
