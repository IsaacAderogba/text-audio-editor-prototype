import { CompositionMetadataState } from "@taep/core";
import { merge } from "lodash-es";
import { toJS } from "mobx";
import { DeepPartial } from "../../utilities/types";
import type { CompositionObservable } from "./state";

export class CompositionMetadataObservable {
  private composition: CompositionObservable;
  state: CompositionMetadataState;

  constructor(composition: CompositionObservable, state: CompositionMetadataState) {
    this.composition = composition;
    this.state = state;
  }

  setState(state: DeepPartial<CompositionMetadataState>) {
    merge(this.state, state);
  }

  toJSON(): CompositionMetadataState {
    return toJS(this.state);
  }
}
