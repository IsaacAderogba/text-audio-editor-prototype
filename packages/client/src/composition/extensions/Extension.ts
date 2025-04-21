import { MarkSpec, NodeSpec } from "prosemirror-model";
import { Command, Plugin } from "prosemirror-state";
import type { Editor } from "../Editor";

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

  initializeSchema?(): {
    nodes?: Record<string, NodeSpec>;
    marks?: Record<string, MarkSpec>;
  };

  initializePlugins?(): Record<string, Plugin>;
  initializeCommands?(): Record<string, (...args: any[]) => Command>;
}
