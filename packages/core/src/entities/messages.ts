import { TrackChange } from "../composition";
import { Chapter, Project } from "./models";

export type ProjectMessage = MessageData<Project>;
export type ChapterMessage = MessageData<Chapter>;
export type ChapterTrackMessage = MessageData<{
  chapterId: string;
  trackId: string;
  change: TrackChange;
}>;

type MessageData<T> = {
  action: "created" | "updated" | "deleted";
  data: T;
};
