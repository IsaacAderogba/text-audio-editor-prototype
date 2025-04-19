import { CompositionEditorState } from "@teap/core";
import { makeAutoObservable } from "mobx";
import { EditorState } from "prosemirror-state";

export class CompositionEditorObservable {
  state: EditorState;

  constructor(state: CompositionEditorState) {
    makeAutoObservable(this);
    // @ts-expect-error - convert json to prosemirror state
    this.state = state;
  }

  setState() {
    // update state based on transaction
  }

  toJSON(): CompositionEditorState {
    return this.state.toJSON();
  }
}
