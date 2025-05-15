import { TrackChange } from "../composition";
import { Chapter, Project } from "./models";

export type WebsocketMessage = ProjectMessage | ChapterMessage | ChapterTrackMessage;

export interface ProjectMessage extends Message {
  channel: "project";
  project: MessageData<Project>;
}

export interface ChapterMessage extends Message {
  channel: "chapter";
  chapter: MessageData<Chapter>;
}

export interface ChapterTrackMessage extends Message {
  channel: "chapterTrack";
  chapterTrack: MessageData<{
    chapterId: string;
    trackId: string;
    change: TrackChange;
  }>;
}

interface Message {
  acknowledged: boolean;
}

type MessageData<T> = {
  action: "created" | "updated" | "deleted";
  data: T;
};
