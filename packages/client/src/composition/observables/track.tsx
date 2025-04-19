import { CompositionTrackState } from "@teap/core";
import { merge } from "lodash-es";
import { DeepPartial } from "../../utilities/types";
import { toJS } from "mobx";

export class CompositionTrackObservable {
  state: CompositionTrackState;

  constructor(state: CompositionTrackState) {
    this.state = state;
  }

  setState(state: DeepPartial<CompositionTrackState>) {
    merge(this.state, state);
  }

  toJSON(): CompositionTrackState {
    return toJS(this.state);
  }
}
