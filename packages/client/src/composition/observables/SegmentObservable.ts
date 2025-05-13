import { Segment } from "@taep/core";
import { merge } from "lodash-es";
import { DeepPartial } from "../../utilities/types";
import { makeAutoObservable, toJS } from "mobx";
import { CompositionObservable } from "./CompositionTrackObservable";

export class SegmentObservable {
  private composition: CompositionObservable;
  state: Segment;

  constructor(composition: CompositionObservable, state: Segment) {
    makeAutoObservable(this);

    this.composition = composition;
    this.state = state;
  }

  setState(state: DeepPartial<Segment>) {
    merge(this.state, state);
  }

  toJSON(): Segment {
    return toJS(this.state);
  }
}

// todo - find a way to represent this inside of DocumentTrackObservable and MediaTrackObservable
