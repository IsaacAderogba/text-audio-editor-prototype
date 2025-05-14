import { BoldAnnotationAttrs, MarkName } from "@taep/core";
import { CSS } from "../../../utilities/stitches";
import { EditorCommand } from "../../prosemirror/command/EditorCommand";
import { KeymapPlugin } from "../../prosemirror/plugin/KeymapPlugin";
import { MarkExtension } from "../Extension";

export class BoldExtension extends MarkExtension {
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

  initializeCSS = () => {
    const css: CSS = { display: "inline", fontWeight: "$bold" };
    return { compact: css, default: css };
  };
}

export type ToggleBold<T = EditorCommand> = (attrs: Partial<BoldAnnotationAttrs>) => T;

type BoldCommands<T> = {
  toggleBold: ToggleBold<T>;
};

declare global {
  interface Commands<T> extends BoldCommands<T> {}
}
