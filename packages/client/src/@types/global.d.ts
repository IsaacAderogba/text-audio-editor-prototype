/* eslint-disable @typescript-eslint/no-unused-vars */

import { EditorCommand } from "../composition/prosemirror/command/EditorCommand";

declare global {
  interface Commands<T = EditorCommand> {}
}
