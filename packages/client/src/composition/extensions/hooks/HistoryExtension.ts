import { history, redo as _redo, undo as _undo } from "prosemirror-history";
import { Extension } from "../Extension";
import { KeymapPlugin } from "../../prosemirror/plugin/KeymapPlugin";
import { Command } from "prosemirror-state";
import { makeCommandChainable } from "../../prosemirror/command/chain";
import { isMac } from "../../utilities/browser";

export class HistoryExtension extends Extension {
  name = "history";

  initializePlugins = () => {
    return {
      history: history(),
      "history-keymap": new KeymapPlugin({
        "Mod-z": undo(),
        [isMac ? "Shift-Mod-z" : "Mod-y"]: redo()
      })
    };
  };

  initializeCommands = (): HistoryCommands<Command> => {
    return { undo, redo };
  };
}

export type Undo<T = Command> = () => T;
export const undo: Undo = makeCommandChainable(_undo);

export type Redo<T = Command> = () => T;
export const redo: Undo = makeCommandChainable(_redo);

type HistoryCommands<T> = {
  undo: Undo<T>;
  redo: Redo<T>;
};

declare global {
  interface Commands<T> extends HistoryCommands<T> {}
}
