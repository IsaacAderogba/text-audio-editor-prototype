import { deleteRange, DeleteRange } from "../../prosemirror/command/deleteRange";
import { deleteSelection, DeleteSelection } from "../../prosemirror/command/deleteSelection";
import { insertText, InsertText } from "../../prosemirror/command/insertText";
import { replaceRangeWith, ReplaceRangeWith } from "../../prosemirror/command/replaceRangeWith";
import { scrollIntoView, ScrollIntoView } from "../../prosemirror/command/scrollIntoView";
import { setDocAttributes, SetDocAttributes } from "../../prosemirror/command/setDocAttributes";
import { setNodeAttributes, SetNodeAttributes } from "../../prosemirror/command/setNodeAttributes";
import { toggleMark, ToggleMark } from "../../prosemirror/command/toggleMark";
import { updateBlock, UpdateBlock } from "../../prosemirror/command/updateBlock";
import { updateSegment, UpdateSegment } from "../../prosemirror/command/updateSegment";
import { updateTrack, UpdateTrack } from "../../prosemirror/command/updateTrack";
import { EditorCommand } from "../../prosemirror/transform/chain";
import { HookExtension } from "../Extension";

export class CommandsExtension extends HookExtension {
  name = "commands";

  initializeCommands = (): CommandsCommands<EditorCommand> => {
    return {
      deleteRange,
      deleteSelection,
      insertText,
      replaceRangeWith,
      scrollIntoView,
      setNodeAttributes,
      setDocAttributes,
      toggleMark,
      updateBlock,
      updateSegment,
      updateTrack
    };
  };
}

type CommandsCommands<T> = {
  deleteRange: DeleteRange<T>;
  deleteSelection: DeleteSelection<T>;
  insertText: InsertText<T>;
  replaceRangeWith: ReplaceRangeWith<T>;
  scrollIntoView: ScrollIntoView<T>;
  setNodeAttributes: SetNodeAttributes<T>;
  setDocAttributes: SetDocAttributes<T>;
  toggleMark: ToggleMark<T>;
  updateBlock: UpdateBlock<T>;
  updateSegment: UpdateSegment<T>;
  updateTrack: UpdateTrack<T>;
};

declare global {
  interface Commands<T> extends CommandsCommands<T> {}
}
