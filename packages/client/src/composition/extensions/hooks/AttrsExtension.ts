import { Block, DocumentSegment, DocumentTrack, getAttrs, NodeGroup } from "@taep/core";
import { Plugin } from "prosemirror-state";
import { v4 } from "uuid";
import { findChangedNodes } from "../../prosemirror/state/nodes";
import { ChainableTransaction } from "../../prosemirror/transform/transaction";
import { HookExtension } from "../Extension";

export class AttrsExtension extends HookExtension {
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

          const trackAttrs = getAttrs<DocumentTrack>(newState.doc);
          if (!trackAttrs.id) {
            const trackId = v4();
            tr.chain.setDocAttribute("id", trackId);
            tr.chain.setDocAttribute("createdAt", date);
            tr.chain.setDocAttribute("updatedAt", date);
            trackAttrs.id = trackId;
          }

          for (const transaction of transactions) {
            const groups = [NodeGroup.block, NodeGroup.segment];
            const nodes = findChangedNodes(transaction, {
              nodeFilter: node => groups.some(group => node.type.isInGroup(group))
            });

            for (const { pos, node } of nodes) {
              tr.chain.setNodeAttribute(pos, "updatedAt", date);
              if (!getAttrs<Block | DocumentSegment>(node).id) {
                tr.chain.setNodeAttribute(pos, "id", v4());
                tr.chain.setNodeAttribute(pos, "trackId", trackAttrs.id);
                tr.chain.setNodeAttribute(pos, "createdAt", date);
              }
            }
          }

          return tr.chainedTransaction;
        }
      })
    };
  };
}
