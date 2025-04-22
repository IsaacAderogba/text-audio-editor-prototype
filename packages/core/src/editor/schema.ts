import { MarkSpec, NodeSpec, Schema } from "prosemirror-model";
import {
  CompositionBoldAnnotationState,
  CompositionDocumentEditorState,
  CompositionParagraphBlockState,
  CompositionSpaceSegmentState,
  CompositionVoiceSegmentState
} from "../composition";
import { createAttrs, createAttrsDOMParser, mergeMarkAttrs, mergeNodeAttrs } from "./attrs";

enum NodeGroups {
  editor = "editor",
  block = "block",
  segment = "segment",
  inline = "inline"
}

enum NodeContent {
  "block+" = "block+",
  "segment+" = "segment+",
  "inline*" = "inline*"
}

enum MarkGroups {
  decoration = "decoration", // search highlighting, etc..
  annotation = "annotation" // bolds, italics, etc...
}

export const nodeSpecs: Record<string, NodeSpec> = {
  // editors
  document: {
    content: NodeContent["block+"],
    group: NodeGroups.editor,
    attrs: createAttrs<CompositionDocumentEditorState>({ id: "", createdAt: "", updatedAt: "" }),
    toDOM: node => ["main", mergeNodeAttrs(node, { class: "document" }), 0]
  },

  // blocks
  paragraph: {
    content: NodeContent["segment+"],
    group: NodeGroups.block,
    attrs: createAttrs<CompositionParagraphBlockState>({ id: "", createdAt: "", updatedAt: "" }),
    parseDOM: [
      { tag: "p", getAttrs: createAttrsDOMParser("paragraph") },
      { tag: "p", priority: 1 }
    ],
    toDOM: node => {
      return ["p", mergeNodeAttrs(node, { class: "paragraph" }), 0];
    }
  },

  // segments
  voice: {
    inline: true,
    content: NodeContent["inline*"],
    group: NodeGroups.segment,
    attrs: createAttrs<CompositionVoiceSegmentState>({
      id: "",
      voiceId: "",
      trackId: "",
      from: 0,
      duration: 0,
      playbackRate: 1,
      createdAt: "",
      updatedAt: ""
    }),
    parseDOM: [{ tag: "span", getAttrs: createAttrsDOMParser("voice") }],
    toDOM: node => {
      return ["span", mergeNodeAttrs(node, { class: "voice" }), 0];
    }
  },
  space: {
    atom: true,
    inline: true,
    group: NodeGroups.segment,
    attrs: createAttrs<CompositionSpaceSegmentState>({
      id: "",
      trackId: "",
      from: 0,
      duration: 0,
      playbackRate: 1,
      createdAt: "",
      updatedAt: ""
    }),
    parseDOM: [{ tag: "span", getAttrs: createAttrsDOMParser("space") }],
    toDOM: node => {
      return ["span", mergeNodeAttrs(node, { class: "space" }), 0];
    }
  },

  // inlines
  text: {
    inline: true,
    group: NodeGroups.inline
  }
};

export const markSpecs: Record<string, MarkSpec> = {
  // annotation
  bold: {
    group: MarkGroups.annotation,
    attrs: createAttrs<CompositionBoldAnnotationState>({}),
    parseDOM: [
      { tag: "b", getAttrs: createAttrsDOMParser("bold") },
      { tag: "b" },
      { tag: "strong" }
    ],
    toDOM: mark => {
      return ["b", mergeMarkAttrs(mark, { class: "bold" }), 0];
    }
  }
};

export const documentSchema = new Schema({
  nodes: nodeSpecs,
  marks: markSpecs,
  topNode: "document"
});
