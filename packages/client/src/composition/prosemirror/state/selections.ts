import { TextSelection } from "prosemirror-state";

export const isTextSelection = (value: unknown): value is TextSelection => {
  return value instanceof TextSelection;
};

export const isCursorSelection = (value: unknown): value is TextSelection => {
  return isTextSelection(value) && value.empty;
};
