import { Node } from "prosemirror-model";
import { Transaction } from "prosemirror-state";
import { findChangedBlockRanges, FindRangeOptions } from "./ranges";

export interface ResolvedNode {
  node: Node;
  parent: Node | null;
  pos: number;
}

export interface FindNodeOptions extends FindRangeOptions {
  traverse: boolean;
  nodeFilter: (node: Node) => boolean;
}

export interface FindRelativeNodeOptions extends FindNodeOptions {
  // posOffset helps us compute the absolute position because relative methods like `node.descendants` only return relative positions
  posOffset: number;
}

const defaultNodeOptions: FindNodeOptions = {
  stepFilter: () => true,
  traverse: true,
  nodeFilter: () => true
};

const defaultRelativeNodeOptions: FindRelativeNodeOptions = {
  traverse: true,
  posOffset: 0,
  stepFilter: () => true,
  nodeFilter: () => true
};

export const findChangedNodes = (
  tr: Transaction,
  findOptions: Partial<FindNodeOptions> = {}
): ResolvedNode[] => {
  const options = { ...defaultNodeOptions, ...findOptions };

  const nodeSet = new Set<Node>();
  const nodes: ResolvedNode[] = [];

  for (const range of findChangedBlockRanges(tr, options)) {
    const { start, end } = range;

    tr.doc.nodesBetween(start, end, (node, pos, parent) => {
      if (options.nodeFilter(node) && !nodeSet.has(node)) {
        nodes.push({ node, pos, parent });
        nodeSet.add(node);
      }

      return options.traverse;
    });
  }

  return nodes;
};

export const findNodeChildren = (
  node: Node,
  findOptions: Partial<FindRelativeNodeOptions>
): ResolvedNode[] => {
  const options = { ...defaultRelativeNodeOptions, ...findOptions };
  const children: ResolvedNode[] = [];

  node.descendants((node, relativePos, parent) => {
    const pos = relativePos + options.posOffset;
    if (options.nodeFilter(node)) {
      children.push({ node, pos, parent });
    }

    return options.traverse;
  });

  return children;
};
