/* eslint-disable @typescript-eslint/no-unused-vars */
import { Command } from "prosemirror-state";

declare global {
  interface Commands<T = Command> {}
}
