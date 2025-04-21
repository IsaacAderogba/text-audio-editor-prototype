import { CompositionSegmentState } from "@taep/core";
import { merge } from "lodash-es";
import { makeAutoObservable, toJS } from "mobx";
import { DeepPartial } from "../../utilities/types";
import { CompositionObservable } from "./state";

export class CompositionSegmentObservable {
  private composition: CompositionObservable;
  state: CompositionSegmentState;

  constructor(composition: CompositionObservable, state: CompositionSegmentState) {
    makeAutoObservable(this);

    this.composition = composition;
    this.state = state;
  }

  setState(state: DeepPartial<CompositionSegmentState>) {
    merge(this.state, state);
  }

  toJSON(): CompositionSegmentState {
    return toJS(this.state);
  }
}
