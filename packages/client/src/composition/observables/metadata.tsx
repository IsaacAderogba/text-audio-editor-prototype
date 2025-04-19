import { CompositionMetadataState } from "@teap/core";
import { merge } from "lodash-es";
import { toJS } from "mobx";
import { DeepPartial } from "../../utilities/types";

export class CompositionMetadataObservable {
  state: CompositionMetadataState;

  constructor(state: CompositionMetadataState) {
    this.state = state;
  }

  setState(state: DeepPartial<CompositionMetadataState>) {
    merge(this.state, state);
  }

  toJSON(): CompositionMetadataState {
    return toJS(this.state);
  }
}
