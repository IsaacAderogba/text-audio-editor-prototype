import { CompositionTrackState } from "@taep/core";
import { merge } from "lodash-es";
import { DeepPartial } from "../../utilities/types";
import { makeAutoObservable, toJS } from "mobx";
import { CompositionObservable } from "./state";

export class CompositionTrackObservable {
  private composition: CompositionObservable;
  state: CompositionTrackState;

  constructor(composition: CompositionObservable, state: CompositionTrackState) {
    makeAutoObservable(this);

    this.composition = composition;
    this.state = state;
  }

  setState(state: DeepPartial<CompositionTrackState>) {
    merge(this.state, state);
  }

  toJSON(): CompositionTrackState {
    return toJS(this.state);
  }
}
