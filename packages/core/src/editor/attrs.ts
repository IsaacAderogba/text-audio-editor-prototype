import { AttributeSpec, Mark, Node } from "prosemirror-model";
import { Annotation, Block, Inline, PageSegment, DocumentTrack } from "../composition";

export const setAttrs = <T extends Annotation | Inline | PageSegment | Block | DocumentTrack>(
  attrs: T["attrs"]
) => attrs;

export const getAttrs = <T extends Annotation | Inline | PageSegment | Block | DocumentTrack>(
  node: Node
): T["attrs"] => ({ ...node.attrs });

export const createAttrs = <T extends Annotation | Inline | PageSegment | Block | DocumentTrack>(
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

export const createAttrsDOMParser = (type: string) => (element: string | HTMLElement) => {
  if (typeof element === "string") return false;

  const dataType = element.getAttribute("data-type");
  if (dataType === type) {
    console.log("parsed", type);
    const attrs = element.getAttribute(type);
    return attrs ? JSON.parse(attrs) : {};
  }
  return false;
};
