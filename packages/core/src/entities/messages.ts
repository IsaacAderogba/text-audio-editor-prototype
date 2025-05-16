import { DocumentTrack, DocumentTrackDelta, MediaTrack, MediaTrackDelta } from "../composition";

export type DocumentTrackMessage = DocumentTrackMessageWhere & DocumentTrackMessageData;
export type DocumentTrackMessageData =
  | { action: "created"; data: DocumentTrack }
  | { action: "updated"; data: DocumentTrackDelta }
  | { action: "deleted"; data: DocumentTrack };
export type DocumentTrackMessageWhere = { where: { chapterId: string; trackId: string } };

export type MediaTrackMessage = MediaTrackMessageWhere & MediaTrackMessageData;
export type MediaTrackMessageData =
  | { action: "created"; data: MediaTrack }
  | { action: "updated"; data: MediaTrackDelta }
  | { action: "deleted"; data: MediaTrack };
export type MediaTrackMessageWhere = { where: { chapterId: string; trackId: string } };
