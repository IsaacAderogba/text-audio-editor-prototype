import { base, keyName } from "w3c-keyname";
import { Plugin, PluginSpec } from "prosemirror-state";
import { EditorCommand } from "../command/EditorCommand";
import { isMac } from "../../utilities/browser";
import { EditorView } from "prosemirror-view";
import type { DocumentEditor } from "../DocumentEditor";

export type Keymap = Record<string, EditorCommand>;
type KeymapState = undefined;

export class KeymapPlugin extends Plugin<KeymapState> {
  constructor(
    editor: DocumentEditor,
    keymap: Keymap,
    { props = {}, ...rest }: PluginSpec<KeymapState> = {}
  ) {
    const platformBindings: Keymap = {};
    for (const key in keymap) {
      const platformKey = key.replace(/Mod/i, isMac ? "Meta" : "Ctrl");
      platformBindings[platformKey] = keymap[key];
    }

    super({
      props: {
        handleKeyDown: (view: EditorView, event: KeyboardEvent): boolean => {
          const name = keyName(event);
          const isChar = name.length === 1 && name != " ";
          const key = bindModifiers(event, name, isChar);

          const command = platformBindings[key];
          if (command) return command(view.state, view.dispatch, view, editor);

          const baseName = base[event.keyCode];
          const modifierActive = event.shiftKey || event.altKey || event.metaKey || event.ctrlKey;

          if (isChar && modifierActive && baseName != name) {
            const command = platformBindings[bindModifiers(event, baseName, true)];
            if (command) return command(view.state, view.dispatch, view, editor);
          }

          return false;
        },
        ...props
      },
      ...rest
    });
  }
}

function bindModifiers(event: KeyboardEvent, key: string, shift: boolean) {
  if (event.altKey) key = "Alt-" + key;
  if (event.ctrlKey) key = "Ctrl-" + key;
  if (event.metaKey) key = "Meta-" + key;
  if (shift !== false && event.shiftKey) key = "Shift-" + key;
  return key;
}
