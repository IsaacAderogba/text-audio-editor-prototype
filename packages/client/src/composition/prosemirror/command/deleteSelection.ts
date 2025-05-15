import { deleteSelection as _deleteSelection } from "prosemirror-commands";
import { convertCommand, EditorCommand } from "../transform/chain";

export type DeleteSelection<T = EditorCommand> = () => T;
export const deleteSelection: DeleteSelection = convertCommand(_deleteSelection);
