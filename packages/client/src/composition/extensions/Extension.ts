import { Command, Plugin } from "prosemirror-state";
import type { Editor } from "../prosemirror/DocumentEditor";

export abstract class Extension {
  abstract name: string;

  private _editor?: Editor;
  get editor() {
    if (!this._editor) {
      throw new Error("Cannot access `editor` before it has been bound.");
    }
    return this._editor;
  }

  bind = (editor: Editor) => {
    this._editor = editor;
    return this;
  };

  initializePlugins?(): Record<string, Plugin>;
  initializeCommands?(): Record<string, (...args: any[]) => Command>;
}
