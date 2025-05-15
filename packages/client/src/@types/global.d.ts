/* eslint-disable @typescript-eslint/no-unused-vars */

import { EditorCommand } from "../composition/prosemirror/transform/chain";

declare global {
  interface Commands<T = EditorCommand> {}
}
