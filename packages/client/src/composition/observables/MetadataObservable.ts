import { Metadata } from "@taep/core";
import { merge } from "lodash-es";
import { toJS } from "mobx";
import { DeepPartial } from "../../utilities/types";
import type { CompositionObservable } from "./CompositionObservable";

export class MetadataObservable {
  private composition: CompositionObservable;
  state: Metadata;

  constructor(composition: CompositionObservable, state: Metadata) {
    this.composition = composition;
    this.state = state;
  }

  setState(state: DeepPartial<Metadata>) {
    merge(this.state, state);
  }

  toJSON(): Metadata {
    return toJS(this.state);
  }
}
