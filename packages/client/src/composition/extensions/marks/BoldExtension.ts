import { BoldAnnotationAttrs, MarkName } from "@taep/core";
import { Extension } from "../Extension";
import { KeymapPlugin } from "../../prosemirror/plugin/KeymapPlugin";
import { EditorCommand } from "../../prosemirror/command/EditorCommand";

export class BoldExtension extends Extension {
  name = MarkName.bold;

  initializeCommands = (): BoldCommands<EditorCommand> => {
    return {
      toggleBold: attrs => {
        return this.editor.commands.toggleMark({ type: "bold", attrs });
      }
    };
  };

  initializePlugins = () => {
    return {
      "bold-keymap": new KeymapPlugin(this.editor, {
        "Mod-b": this.editor.commands.toggleBold({})
      })
    };
  };
}

export type ToggleBold<T = EditorCommand> = (attrs: Partial<BoldAnnotationAttrs>) => T;

type BoldCommands<T> = {
  toggleBold: ToggleBold<T>;
};

declare global {
  interface Commands<T> extends BoldCommands<T> {}
}
