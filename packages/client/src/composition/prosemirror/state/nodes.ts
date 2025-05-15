import { Node } from "prosemirror-model";
import { Transaction } from "prosemirror-state";
import { findChangedBlockRanges, FindRangeOptions } from "./ranges";

export interface ResolvedNode {
  node: Node;
  pos: number;
  parent: Node | null;
}

export interface FindNodeOptions {
  traverse: boolean;
  nodeFilter: (node: Node) => boolean;
}

const defaultFindNodeOptions: FindNodeOptions = {
  traverse: true,
  nodeFilter: () => true
};

export interface FindRelativeNodeOptions extends FindNodeOptions {
  // posOffset helps us compute the absolute position because relative methods like `node.descendants` only return relative positions
  posOffset: number;
}

const defaultFindRelativeNodeOptions: FindRelativeNodeOptions = {
  traverse: true,
  posOffset: 0,
  nodeFilter: () => true
};

export interface FindRangeNodeOptions extends FindRangeOptions {
  traverse: boolean;
  nodeFilter: (node: Node) => boolean;
}

const defaultFindRangeNodeOptions: FindRangeNodeOptions = {
  stepFilter: () => true,
  traverse: true,
  nodeFilter: () => true
};

export const findChangedNodes = (
  tr: Transaction,
  findOptions: Partial<FindRangeNodeOptions> = {}
): ResolvedNode[] => {
  const options = { ...defaultFindRangeNodeOptions, ...findOptions };

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
  findOptions: Partial<FindRelativeNodeOptions> = {}
): ResolvedNode[] => {
  const options = { ...defaultFindRelativeNodeOptions, ...findOptions };
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

export const findNode = (
  node: Node,
  findOptions: Partial<FindRelativeNodeOptions> = {}
): ResolvedNode | null => {
  const options = { ...defaultFindNodeOptions, ...findOptions };
  let resolvedNode: ResolvedNode | null = null;

  node.descendants((node, pos, parent) => {
    if (options.nodeFilter(node) && !resolvedNode) {
      resolvedNode = { node, pos, parent };
    }

    return resolvedNode === null && options.traverse;
  });

  return resolvedNode;
};
