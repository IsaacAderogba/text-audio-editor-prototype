import { Command, Plugin, PluginSpec } from "prosemirror-state";
import { keydownHandler } from "prosemirror-keymap";

export type Keymap = Record<string, Command>;
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
