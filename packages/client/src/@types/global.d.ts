/* eslint-disable @typescript-eslint/no-unused-vars */
import type { EditorCommand } from "../composition/prosemirror/command/chain";

declare global {
  interface Commands<T = EditorCommand> {}
}
