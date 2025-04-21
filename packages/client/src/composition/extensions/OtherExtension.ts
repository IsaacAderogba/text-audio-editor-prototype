import { Command } from "prosemirror-state";

type Example<T = Command> = (data: string) => T;

declare global {
  interface Commands<T> {
    example: Example<T>;
  }
}
