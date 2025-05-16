import { DocumentTrackChange, MediaTrackChange } from "../composition";
import { Chapter, Project } from "./models";

export type ProjectMessage = MessageData<Project>;
export type ChapterMessage = MessageData<Chapter>;

export type DocumentTrackChangeMessage = MessageData<{
  chapterId: string;
  trackId: string;
  change: DocumentTrackChange;
}>;

export type MediaTrackChangeMessage = MessageData<{
  chapterId: string;
  trackId: string;
  change: MediaTrackChange;
}>;

type MessageData<T> = {
  action: "created" | "updated" | "deleted";
  data: T;
};
