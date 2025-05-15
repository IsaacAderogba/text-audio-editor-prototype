import { Annotation, Block, DocumentSegment, DocumentTrack, Inline } from "@taep/core";
import { Mark, Node, Schema } from "prosemirror-model";

export function trackToNode(track: DocumentTrack, schema: Schema): Node {
  const nodeType = schema.nodes[track.type];
  if (!nodeType) {
    throw new Error(`Can't process track type '${track.type}'`);
  }

  return nodeType.create(
    track.attrs,
    track.content.map(block => blockToNode(block, schema))
  );
}

export function blockToNode(block: Block, schema: Schema): Node {
  const nodeType = schema.nodes[block.type];
  if (!nodeType) {
    throw new Error(`Can't process block type '${block.type}'`);
  }

  return nodeType.create(
    block.attrs,
    block.content.map(segment => segmentToNode(segment, schema))
  );
}

export function segmentToNode(segment: DocumentSegment, schema: Schema): Node {
  const nodeType = schema.nodes[segment.type];
  if (!nodeType) {
    throw new Error(`Can't process segment type '${segment.type}'`);
  }

  return nodeType.create(
    segment.attrs,
    segment.content.map(inline => inlineToNode(inline, schema))
  );
}

export function inlineToNode(inline: Inline, schema: Schema): Node {
  const marks = inline.marks.map(annotaiton => annotationToMark(annotaiton, schema));

  switch (inline.type) {
    case "text": {
      return schema.text(inline.attrs.text, marks);
    }
    default:
      throw new Error(`Can't process inline type '${inline.type}'`);
  }
}

export function annotationToMark(annotation: Annotation, schema: Schema): Mark {
  return schema.mark(annotation.type, annotation.attrs);
}
