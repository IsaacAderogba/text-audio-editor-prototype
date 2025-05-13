import { SegmentAttrs } from "./timeline";

/**
 * EditorStates
 */
export type EditorType = CompositionEditorState["type"];
export type CompositionEditorState = CompositionDocumentEditorState;

export type CompositionDocumentEditorState = {
  type: "document";
  attrs: CompositionDocumentEditorAttrs;
  content: CompositionEditorBlockState[];
};

export interface CompositionDocumentEditorAttrs {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Block States
 */
export type EditorBlockType = CompositionEditorBlockState["type"];
export type CompositionEditorBlockState = CompositionParagraphBlockState;

export type CompositionParagraphBlockState = {
  type: "paragraph";
  attrs: CompositionParagraphBlockAttrs;
  content: CompositionEditorSegmentState[];
};

export interface CompositionParagraphBlockAttrs {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Segment States
 */
export type EditorSegmentType = CompositionEditorSegmentState["type"];
export type CompositionEditorSegmentState = CompositionVoiceSegmentState;

export type CompositionVoiceSegmentState = {
  type: "voice";
  attrs: CompositionVoiceSegmentAttrs;
  content: CompositionEditorInlineState[];
};

interface CompositionVoiceSegmentAttrs extends SegmentAttrs {
  voiceId: string;
}

/**
 * InlineStates
 */
export type EditorInlineType = CompositionEditorInlineState["type"];
export type CompositionEditorInlineState = CompositionTextInlineState;

export interface CompositionTextInlineState {
  type: "text";
  attrs: CompositionTextInlineAttrs;
  marks: CompositionEditorAnnotationState[];
}

export interface CompositionTextInlineAttrs {
  text: string;
}
/**
 * AnnotationStates
 */
export type EditorAnnotationType = CompositionEditorAnnotationState["type"];
export type CompositionEditorAnnotationState = CompositionBoldAnnotationState;

export interface CompositionBoldAnnotationState {
  type: "bold";
  attrs: CompositionBoldAnnotationAttrs;
}

export interface CompositionBoldAnnotationAttrs {}
