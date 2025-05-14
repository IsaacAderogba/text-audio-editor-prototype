import { Plugin } from "prosemirror-state";
import type { DocumentEditor } from "../prosemirror/DocumentEditor";
import { EditorCommand } from "../prosemirror/command/EditorCommand";
import { CSS, Size } from "../../utilities/stitches";

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

export abstract class HookExtension extends Extension {}
export function isHookExtension(ext: unknown): ext is HookExtension {
  return ext instanceof HookExtension;
}

export abstract class NodeExtension extends Extension {
  initializeCSS?(): Record<Size, CSS>;
}
export function isNodeExtension(ext: unknown): ext is NodeExtension {
  return ext instanceof NodeExtension;
}

export abstract class MarkExtension extends Extension {
  initializeCSS?(): Record<Size, CSS>;
}

export function isMarkExtension(ext: unknown): ext is MarkExtension {
  return ext instanceof MarkExtension;
}
