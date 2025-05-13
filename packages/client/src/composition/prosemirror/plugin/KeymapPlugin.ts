import { keydownHandler } from "prosemirror-keymap";
import { Plugin, PluginSpec } from "prosemirror-state";
import { EditorCommand } from "../command/chain";

export type Keymap = Record<string, EditorCommand>;
type KeymapState = undefined;

export class KeymapPlugin extends Plugin<KeymapState> {
  constructor(
    public keymap: Keymap,
    { props = {}, ...rest }: PluginSpec<KeymapState> = {}
  ) {
    super({
      props: { handleKeyDown: keydownHandler(keymap), ...props },
      ...rest
    });
  }
}
