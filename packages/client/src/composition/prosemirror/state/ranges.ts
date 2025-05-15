import { uniqBy } from "lodash";
import { Transaction } from "prosemirror-state";

import { isAttrStep, isRangeStep } from "./steps";
import { Step } from "prosemirror-transform";
import { Mark, Node, NodeRange } from "prosemirror-model";
import { NodeGroup } from "@taep/core";

export interface Range {
  from: number;
  to: number;
}

export interface RangeNode extends Range {
  node: Node;
}

export interface RangeMark extends Range {
  mark: Mark;
}

export interface FindRangeOptions {
  stepFilter: (step: Step) => boolean;
}

const defaultRangeOptions: FindRangeOptions = {
  stepFilter: () => true
};

export const isAtTextEdgeOfBlock = (doc: Node, pos: number) => {
  const resolvedPos = doc.resolve(pos);
  let depth = resolvedPos.depth;

  while (depth >= 0) {
    const node = resolvedPos.node(depth);
    if (node.type.isInGroup(NodeGroup.block)) {
      const nodePos = resolvedPos.before(depth);
      const contentStart = nodePos + 2;
      const contentEnd = nodePos + node.content.size;
      return pos <= contentStart || pos >= contentEnd;
    }

    depth--;
  }

  return false;
};

export const removeRedundantRanges = (ranges: Range[]): Range[] => {
  const uniqueRanges = uniqBy(
    ranges.sort((a, b) => a.from - b.from),
    r => `${r.from}_${r.to}`
  );
  return uniqueRanges.filter((range, i, arr) => {
    return !arr.some((otherRange, j) => {
      if (i === j) return false;

      return range.from >= otherRange.from && range.to <= otherRange.to;
    });
  });
};

export const findChangedRanges = (
  tr: Transaction,
  findOptions: Partial<FindRangeOptions> = {}
): Range[] => {
  const options = { ...defaultRangeOptions, ...findOptions };

  const ranges: Range[] = [];
  tr.steps.forEach((step, i) => {
    if (!options.stepFilter(step)) return;
    const stepRanges: Range[] = [];
    const stepMap = step.getMap();

    // @ts-expect-error - ranges is an internal property
    if (stepMap.ranges.length === 0 && isRangeStep(step)) {
      stepRanges.push({ from: step.from, to: step.to });
    } else if (isAttrStep(step)) {
      stepRanges.push({ from: step.pos, to: step.pos + 1 });
    } else {
      stepMap.forEach((from, to) => {
        stepRanges.push({ from, to });
      });
    }

    const mapping = tr.mapping.slice(i);
    stepRanges.forEach(range => {
      const from = mapping.map(range.from, -1);
      const to = mapping.map(range.to);

      if (!isRangeStep(step)) {
        ranges.push({ from, to });
      } else if (isAtTextEdgeOfBlock(tr.before, from)) {
        ranges.push({ from: from + 2, to });
      } else {
        ranges.push({ from, to });
      }
    });
  });

  return ranges;
};

export const findChangedBlockRanges = (
  tr: Transaction,
  findOptions: Partial<FindRangeOptions> = {}
): NodeRange[] => {
  const options = { ...defaultRangeOptions, ...findOptions };

  const nodeRanges: NodeRange[] = [];
  const ranges = findChangedRanges(tr, options);

  for (const range of removeRedundantRanges(ranges)) {
    try {
      const $from = tr.doc.resolve(range.from);
      const $to = tr.doc.resolve(range.to);
      const nodeRange = $from.blockRange($to);
      if (!nodeRange) continue;

      nodeRanges.push(nodeRange);
    } catch {
      // Changed ranged outside the document
    }
  }

  return nodeRanges;
};
