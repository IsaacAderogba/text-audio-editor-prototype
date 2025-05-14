import { MarkSpec, NodeSpec, Schema } from "prosemirror-model";
import { BoldAnnotation, PageTrack, ParagraphBlock, VoiceSegment } from "../composition";
import { createAttrs, createAttrsDOMParser, mergeMarkAttrs, mergeNodeAttrs } from "./attrs";

export enum NodeGroup {
  track = "track",
  block = "block",
  segment = "segment",
  inline = "inline"
}

export enum NodeName {
  page = "page",
  paragraph = "paragraph",
  voice = "voice",
  text = "text"
}

export enum NodeContent {
  "block+" = "block+",
  "segment+" = "segment+",
  "inline*" = "inline*"
}

export enum MarkGroup {
  decoration = "decoration", // search highlighting, etc..
  annotation = "annotation" // bolds, italics, etc...
}

export enum MarkName {
  bold = "bold"
}

export const nodeSpecs: Record<`${NodeName}`, NodeSpec> = {
  // tracks
  page: {
    content: NodeContent["block+"],
    group: NodeGroup.track,
    attrs: createAttrs<PageTrack>({
      id: "",
      latestVersion: 0,
      createdAt: "",
      updatedAt: ""
    }),
    toDOM: node => ["main", mergeNodeAttrs(node, { class: "page" }), 0]
  },

  // blocks
  paragraph: {
    content: NodeContent["segment+"],
    group: NodeGroup.block,
    attrs: createAttrs<ParagraphBlock>({ id: "", createdAt: "", updatedAt: "" }),
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
    group: NodeGroup.segment,
    attrs: createAttrs<VoiceSegment>({
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
  // inlines
  text: {
    inline: true,
    group: NodeGroup.inline
  }
};

export const markSpecs: Record<`${MarkName}`, MarkSpec> = {
  // annotation
  bold: {
    group: MarkGroup.annotation,
    attrs: createAttrs<BoldAnnotation>({}),
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

export const pageSchema = new Schema({
  nodes: nodeSpecs,
  marks: markSpecs,
  topNode: "page"
});
