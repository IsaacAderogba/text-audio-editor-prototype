import { SegmentState } from "./timeline";

/**
 * EditorStates
 */
export type CompositionEditorState = CompositionPageEditorState;

export type CompositionPageEditorState = {
  type: "page";
  attrs: CompositionPageEditorAttrs;
  content: CompositionEditorBlockState[];
};

export interface CompositionPageEditorAttrs {
  id: string;
}

/**
 * Block States
 */
export type CompositionEditorBlockState = CompositionParagraphBlockState;

export type CompositionParagraphBlockState = {
  type: "paragraph";
  attrs: CompositionParagraphBlockAttrs;
  content: CompositionEditorSegmentState[];
};

export interface CompositionParagraphBlockAttrs {
  id: string;
}

/**
 * Segment States
 */
export type CompositionEditorSegmentState = CompositionVoiceSegmentState;

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
export type CompositionEditorAnnotationState = CompositionBoldAnnotationState;

export interface CompositionBoldAnnotationState {
  type: "bold";
  attrs: CompositionBoldAnnotationAttrs;
}

export interface CompositionBoldAnnotationAttrs {}
