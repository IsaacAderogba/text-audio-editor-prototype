import type { SegmentAttrs } from "./MediaTrack";

/**
 * Documents
 */
export type DocumentType = DocumentTrack["type"];
export type DocumentTrack = PageTrack;

export type PageTrack = {
  type: "page";
  attrs: PageDocumentAttrs;
  content: Block[];
};

export interface PageDocumentAttrs {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Block s
 */
export type BlockType = Block["type"];
export type Block = ParagraphBlock;

export type ParagraphBlock = {
  type: "paragraph";
  attrs: ParagraphBlockAttrs;
  content: DocumentSegment[];
};

export interface ParagraphBlockAttrs {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Segments
 */
export type SegmentType = DocumentSegment["type"];
export type DocumentSegment = VoiceSegment;

export type VoiceSegment = {
  type: "voice";
  attrs: VoiceSegmentAttrs;
  content: Inline[];
};

interface VoiceSegmentAttrs extends SegmentAttrs {
  voiceId: string;
}

/**
 * Inlines
 */
export type InlineType = Inline["type"];
export type Inline = TextInline;

export interface TextInline {
  type: "text";
  attrs: TextInlineAttrs;
  marks: Annotation[];
}

export interface TextInlineAttrs {
  text: string;
}
/**
 * Annotations
 */
export type AnnotationType = Annotation["type"];
export type Annotation = BoldAnnotation;

export interface BoldAnnotation {
  type: "bold";
  attrs: BoldAnnotationAttrs;
}

export interface BoldAnnotationAttrs {}
