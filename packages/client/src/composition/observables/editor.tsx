import { CompositionEditorState } from "@taep/core";
import { makeAutoObservable } from "mobx";
import { EditorState } from "prosemirror-state";
import type { CompositionObservable } from "./state";

export class CompositionEditorObservable {
  private composition: CompositionObservable;
  state: EditorState;

  constructor(composition: CompositionObservable, state: CompositionEditorState) {
    makeAutoObservable(this);

    this.composition = composition;
    this.state = state;
  }

  setState() {
    // update state based on transaction
  }

  toJSON(): CompositionEditorState {
    return this.state.toJSON();
  }
}
