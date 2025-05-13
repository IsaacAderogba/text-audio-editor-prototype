import { MediaTrack } from "@taep/core";
import { merge } from "lodash-es";
import { DeepPartial } from "../../utilities/types";
import { makeAutoObservable, toJS } from "mobx";
import { CompositionObservable } from "./CompositionTrackObservable";

export class MediaTrackObservable {
  private composition: CompositionObservable;
  state: MediaTrack;

  constructor(composition: CompositionObservable, state: MediaTrack) {
    makeAutoObservable(this);

    this.composition = composition;
    this.state = state;
  }

  setState(state: DeepPartial<MediaTrack>) {
    merge(this.state, state);
  }

  toJSON(): MediaTrack {
    return toJS(this.state);
  }
}
