import { Extension } from "../Extension";
import { EditorCommand } from "../../prosemirror/command/EditorCommand";
import { deleteRange, DeleteRange } from "../../prosemirror/command/deleteRange";
import { deleteSelection, DeleteSelection } from "../../prosemirror/command/deleteSelection";
import { insertText, InsertText } from "../../prosemirror/command/insertText";
import { replaceRangeWith, ReplaceRangeWith } from "../../prosemirror/command/replaceRangeWith";
import { scrollIntoView, ScrollIntoView } from "../../prosemirror/command/scrollIntoView";
import { toggleMark, ToggleMark } from "../../prosemirror/command/toggleMark";

export class CommandsExtension extends Extension {
  name = "commands";

  initializeCommands = (): CommandsCommands<EditorCommand> => {
    return {
      deleteRange,
      deleteSelection,
      insertText,
      replaceRangeWith,
      scrollIntoView,
      toggleMark
    };
  };
}

type CommandsCommands<T> = {
  deleteRange: DeleteRange<T>;
  deleteSelection: DeleteSelection<T>;
  insertText: InsertText<T>;
  replaceRangeWith: ReplaceRangeWith<T>;
  scrollIntoView: ScrollIntoView<T>;
  toggleMark: ToggleMark<T>;
};

declare global {
  interface Commands<T> extends CommandsCommands<T> {}
}
