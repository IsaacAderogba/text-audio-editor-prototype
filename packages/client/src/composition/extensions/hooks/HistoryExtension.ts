import { history, redo, undo } from "prosemirror-history";
import { Extension } from "../Extension";
import { KeymapPlugin } from "../../prosemirror/plugin/KeymapPlugin";
import { convertCommand } from "../../prosemirror/transform/chain";
import { isMac } from "../../utilities/browser";
import { EditorCommand } from "../../prosemirror/command/EditorCommand";

export class HistoryExtension extends Extension {
  name = "history";

  initializeCommands = (): HistoryCommands<EditorCommand> => {
    return { undo: convertCommand(undo), redo: convertCommand(redo) };
  };

  initializePlugins = () => {
    return {
      history: history(),
      "history-keymap": new KeymapPlugin(this.editor, {
        "Mod-z": this.editor.commands.undo(),
        [isMac ? "Shift-Mod-z" : "Mod-y"]: this.editor.commands.redo()
      })
    };
  };
}

export type Undo<T = EditorCommand> = () => T;
export type Redo<T = EditorCommand> = () => T;

type HistoryCommands<T> = {
  undo: Undo<T>;
  redo: Redo<T>;
};

declare global {
  interface Commands<T> extends HistoryCommands<T> {}
}
