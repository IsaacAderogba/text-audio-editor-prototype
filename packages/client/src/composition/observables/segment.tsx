import { CompositionSegmentState } from "@teap/core";
import { merge } from "lodash-es";
import { toJS } from "mobx";
import { DeepPartial } from "../../utilities/types";

export class CompositionSegmentObservable {
  state: CompositionSegmentState;

  constructor(state: CompositionSegmentState) {
    this.state = state;
  }

  setState(state: DeepPartial<CompositionSegmentState>) {
    merge(this.state, state);
  }

  toJSON(): CompositionSegmentState {
    return toJS(this.state);
  }
}
