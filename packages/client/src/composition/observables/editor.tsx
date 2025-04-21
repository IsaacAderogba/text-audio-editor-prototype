import { CompositionEditorState } from "@taep/core";
import { makeAutoObservable, toJS } from "mobx";
import type { CompositionObservable } from "./state";

export class CompositionEditorObservable {
  private composition: CompositionObservable;
  state: CompositionEditorState;

  constructor(composition: CompositionObservable, state: CompositionEditorState) {
    makeAutoObservable(this);

    this.composition = composition;
    this.state = state;
  }

  setState(state: CompositionEditorState) {
    this.state = state;
  }

  toJSON(): CompositionEditorState {
    return toJS(this.state);
  }
}
