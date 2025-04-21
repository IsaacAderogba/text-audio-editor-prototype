import { AttributeSpec, Mark, Node } from "prosemirror-model";
import {
  CompositionEditorAnnotationState,
  CompositionEditorBlockState,
  CompositionEditorInlineState,
  CompositionEditorSegmentState,
  CompositionEditorState,
  EditorAnnotationType,
  EditorBlockType,
  EditorInlineType,
  EditorSegmentType,
  EditorType
} from "../composition";

export const createAttrs = <
  T extends
    | CompositionEditorAnnotationState
    | CompositionEditorInlineState
    | CompositionEditorSegmentState
    | CompositionEditorBlockState
    | CompositionEditorState
>(
  attrs: T["attrs"]
) => {
  const spec = {} as { [K in keyof T["attrs"]]: AttributeSpec };
  Object.entries(attrs).forEach(([key, value]) => {
    spec[key as keyof T["attrs"]] = { default: value };
  });

  return spec;
};

export function mergeNodeAttrs<T extends Node>(
  node: T,
  ...objects: Record<string, any>[]
): Record<string, any> {
  return mergeAttributes(...objects, {
    "data-type": node.type.name,
    [node.type.name]: JSON.stringify(node.attrs)
  });
}

export function mergeMarkAttrs<T extends Mark>(
  mark: T,
  ...objects: Record<string, any>[]
): Record<string, any> {
  return mergeAttributes(...objects, {
    "data-type": mark.type.name,
    [mark.type.name]: JSON.stringify(mark.attrs)
  });
}

export function mergeAttributes(...objects: Record<string, any>[]): Record<string, any> {
  return objects
    .filter(item => !!item)
    .reduce((items, item) => {
      const mergedAttributes = { ...items };

      Object.entries(item).forEach(([key, value]) => {
        const exists = mergedAttributes[key];

        if (!exists) {
          mergedAttributes[key] = value;

          return;
        }

        if (key === "class") {
          mergedAttributes[key] = [mergedAttributes[key], value].join(" ");
        } else if (key === "style") {
          mergedAttributes[key] = [mergedAttributes[key], value].join("; ");
        } else {
          mergedAttributes[key] = value;
        }
      });

      return mergedAttributes;
    }, {});
}

export const classnames = (...classNames: (string | undefined)[]) => {
  return classNames.filter(name => name).join(" ");
};

export const createClassSelector = (
  ...classNames: [
    EditorAnnotationType | EditorInlineType | EditorSegmentType | EditorBlockType | EditorType,
    ...string[]
  ]
) => {
  const classes = classnames(...classNames);
  const selectors = `.${classes.split(" ").join(".")}`;
  return [classes, selectors] as const;
};
