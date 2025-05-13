import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import type { DocumentEditor } from "../DocumentEditor";

export type EditorCommand = (
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  view: undefined | EditorView,
  editor: DocumentEditor
) => boolean;
