import {
  VideoTrack,
  VideoTrackDelta,
  PageTrack,
  PageTrackDelta,
  AudioTrack,
  AudioTrackDelta
} from "../composition";

export type CompositionMessage = PageCompositionMessage | VideoCompositionMessage;

export type PageCompositionMessage = {
  type: "page";
  where: CompositionMessageWhere;
  data: PageCompositionMessageData;
};

export type PageCompositionMessageData =
  | { action: "created"; change: PageTrack }
  | { action: "updated"; change: PageTrackDelta }
  | { action: "deleted"; change: PageTrack };

export type VideoCompositionMessage = {
  type: "video";
  where: CompositionMessageWhere;
  data: VideoCompositionMessageData;
};
export type VideoCompositionMessageData =
  | { action: "created"; change: VideoTrack }
  | { action: "updated"; change: VideoTrackDelta }
  | { action: "deleted"; change: VideoTrack };

export type AudioCompositionMessage = {
  type: "audio";
  where: CompositionMessageWhere;
  data: AudioCompositionMessageData;
};
export type AudioCompositionMessageData =
  | { action: "created"; change: AudioTrack }
  | { action: "updated"; change: AudioTrackDelta }
  | { action: "deleted"; change: AudioTrack };

export type CompositionMessageWhere = { chapterId: string; trackId: string };
