import { Plugin } from "prosemirror-state";
import type { DocumentEditor } from "../prosemirror/DocumentEditor";
import { EditorCommand } from "../prosemirror/command/chain";

export abstract class Extension {
  abstract name: string;

  private _editor?: DocumentEditor;
  get editor() {
    if (!this._editor) {
      throw new Error("Cannot access `editor` before it has been bound.");
    }
    return this._editor;
  }

  bind = (editor: DocumentEditor) => {
    this._editor = editor;
    return this;
  };

  initializePlugins?(): Record<string, Plugin>;
  initializeCommands?(): Record<string, (...args: any[]) => EditorCommand>;
}
