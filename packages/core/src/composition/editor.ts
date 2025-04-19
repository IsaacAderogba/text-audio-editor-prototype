/**
 * EditorStates
 */
export type CompositionEditorState = CompositionPageEditorState;

export type CompositionPageEditorState = {
  type: "page";
  attrs: {
    id: string;
  };
  content: CompositionBlockState[];
};

/**
 * BlockStates
 */
export type CompositionBlockState = CompositionParagraphBlockState;

export type CompositionParagraphBlockState = {
  type: "paragraph";
  attrs: {
    id: string;
  };
  content: CompositionInlineBlockState[];
};

/**
 * Inline BlockStates
 */
export type CompositionInlineBlockState = CompositionSnippetInlineBlockState;

export type CompositionSnippetInlineBlockState = {
  type: "snippet";
  attrs: {
    id: string;
    voiceId: string;
  };
  content: CompositionInlineState[];
};

/**
 * InlineStates
 */
export type CompositionInlineState = CompositionTextInlineState;

export type CompositionTextInlineState = {
  type: "text";
  attrs: { text: string };
  marks: CompositionAnnotationState[];
};

/**
 * AnnotationStates
 */
export type CompositionAnnotationState = CompositionBoldAnnotationState;

export type CompositionBoldAnnotationState = {
  type: "bold";
  attrs: {};
};
