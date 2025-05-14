import { TrackChange } from "../composition";
import { Chapter, Project } from "./models";

export type WebsocketMessage = ProjectMessage | ChapterMessage | ChapterTrackMessage;

export type ProjectMessage = {
  channel: "project";
  project: Message<Project>;
};

export type ChapterMessage = {
  channel: "chapter";
  chapter: Message<Chapter>;
};

export type ChapterTrackMessage = {
  channel: "chapterTrack";
  chapterTrack: Message<{
    chapterId: string;
    trackId: string;
    change: TrackChange;
  }>;
};

type Message<T> = {
  action: "created" | "updated" | "deleted";
  data: T;
};
