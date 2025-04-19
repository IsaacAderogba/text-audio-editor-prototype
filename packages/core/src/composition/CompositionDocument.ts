/**
 * Documents
 */
export type CompositionDocument = CompositionPageDocument;

export type CompositionPageDocument = {
  type: "page";
  attrs: {
    id: string;
  };
  content: CompositionBlock[];
};

/**
 * Blocks
 */
export type CompositionBlock = CompositionParagraphBlock;

export type CompositionParagraphBlock = {
  type: "paragraph";
  attrs: {
    id: string;
  };
  content: CompositionInlineBlock[];
};

/**
 * Inline Blocks
 */
export type CompositionInlineBlock = CompositionSnippetInlineBlock;

export type CompositionSnippetInlineBlock = {
  type: "snippet";
  attrs: {
    id: string;
    voiceId: string;
  };
  content: CompositionInline[];
};

/**
 * Inlines
 */
export type CompositionInline = CompositionTextInline;

export type CompositionTextInline = {
  type: "text";
  attrs: { text: string };
  marks: CompositionAnnotation[];
};

/**
 * Annotations
 */
export type CompositionAnnotation = CompositionBoldAnnotation;

export type CompositionBoldAnnotation = {
  type: "bold";
  attrs: {};
};
