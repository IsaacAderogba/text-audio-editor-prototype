import { deleteSelection as _deleteSelection } from "prosemirror-commands";
import { convertCommand } from "../transform/chain";
import { EditorCommand } from "./EditorCommand";

export type DeleteSelection<T = EditorCommand> = () => T;
export const deleteSelection: DeleteSelection = convertCommand(_deleteSelection);
