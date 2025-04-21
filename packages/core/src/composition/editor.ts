import { SegmentState } from "./timeline";

/**
 * EditorStates
 */
export type EditorType = CompositionEditorState["type"];
export type CompositionEditorState = CompositionPageEditorState;

export type CompositionPageEditorState = {
  type: "page";
  attrs: CompositionPageEditorAttrs;
  content: CompositionEditorBlockState[];
};

export interface CompositionPageEditorAttrs {
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
export type CompositionEditorSegmentState =
  | CompositionVoiceSegmentState
  | CompositionSpaceSegmentState;

export type CompositionVoiceSegmentState = {
  type: "voice";
  attrs: CompositionVoiceSegmentAttrs;
  content: CompositionEditorInlineState[];
};

interface CompositionVoiceSegmentAttrs extends SegmentState {
  voiceId: string;
}

export type CompositionSpaceSegmentState = {
  type: "space";
  attrs: CompositionSpaceSegmentAttrs;
  content: CompositionEditorInlineState[];
};

interface CompositionSpaceSegmentAttrs extends SegmentState {}

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
