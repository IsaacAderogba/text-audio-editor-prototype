import {
  Chapter,
  DocumentTrackMessage,
  DocumentTrackMessageWhere,
  MediaTrack,
  MediaTrackDelta,
  MediaTrackMessage,
  MediaTrackMessageWhere,
  pageSchema
} from "@taep/core";
import { TRPCError } from "@trpc/server";
import { EventEmitter, on } from "events";
import { Step } from "prosemirror-transform";
import { createDatabaseAdapter } from "../services/database.js";
import { procedure, router } from "../utilities/trpc.js";

const chaptersEmitter = new EventEmitter();
export const chaptersAPI = createDatabaseAdapter("chapters");

const chapterRouter = router({
  read: procedure
    .input(input => {
      return input as {
        id: string;
      };
    })
    .query(({ input }) => {
      return chaptersAPI.read(input.id);
    }),

  list: procedure.query(() => {
    return chaptersAPI.list();
  }),

  create: procedure
    .input(input => {
      return input as {
        data: Chapter;
      };
    })
    .mutation(({ input }) => {
      return chaptersAPI.create(input.data);
    }),

  update: procedure
    .input(input => {
      return input as {
        id: string;
        data: Partial<Chapter>;
      };
    })
    .mutation(({ input }) => {
      return chaptersAPI.update(input.id, input.data);
    }),

  delete: procedure
    .input(input => {
      return input as {
        id: string;
      };
    })
    .mutation(({ input }) => {
      return chaptersAPI.delete(input.id);
    }),

  mediaTrackChange: procedure
    .input(input => input as MediaTrackMessage)
    .mutation(async ({ input }) => {
      const chapter = await chaptersAPI.read(input.where.chapterId);
      if (!chapter) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Chapter not found" });
      }

      const track = chapter.composition.content[input.where.trackId];
      if (!track || track.type === "page") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Track not found" });
      }

      if (input.action === "updated") {
        const latestVersion = track.attrs.latestVersion;
        if (latestVersion !== input.data.version) return track;

        const deltaRecord: Record<MediaTrack["type"], MediaTrackDelta> = {
          video: { ...input.data, steps: input.data.steps.filter(step => step.type === "video") },
          audio: { ...input.data, steps: input.data.steps.filter(step => step.type === "audio") }
        };

        for (const step of deltaRecord[track.type].steps) {
          switch (step.data.type) {
            case "video":
            case "audio":
              Object.assign(track, step.data);
              break;
            case "frame":
            case "sample":
              if (step.action === "deleted") {
                delete track.content[step.data.attrs.id];
              } else {
                track.content[step.data.attrs.id] = step.data;
              }
              break;
          }
        }

        const message: MediaTrackMessage = {
          action: "updated",
          where: input.where,
          data: deltaRecord[track.type]
        };

        track.attrs.latestVersion = latestVersion + message.data.steps.length;
        track.attrs.deltas.push(message.data as any);
        track.attrs.deltas = track.attrs.deltas.slice(-1000);

        chapter.composition.content[input.where.trackId] = track;
        await chaptersAPI.update(input.where.chapterId, chapter);
        chaptersEmitter.emit("mediaTrack", message);

        return message.data;
      } else if (input.action === "created") {
        chapter.composition.content[input.data.attrs.id] = input.data;
        await chaptersAPI.update(input.where.chapterId, chapter);
        return input.data;
      } else {
        delete chapter.composition.content[input.data.attrs.id];
        await chaptersAPI.update(input.where.chapterId, chapter);
        return input.data;
      }
    }),

  onMediaTrackChange: procedure
    .input(input => input as MediaTrackMessageWhere)
    .subscription(async function* ({ input, signal }) {
      for await (const [data] of on(chaptersEmitter, "mediaTrack", { signal })) {
        const message = data as MediaTrackMessageWhere;
        if (message.where.trackId === input.where.trackId) yield message;
      }
    }),

  documentTrackChange: procedure
    .input(input => input as DocumentTrackMessage)
    .mutation(async ({ input }) => {
      const chapter = await chaptersAPI.read(input.where.chapterId);
      if (!chapter) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Chapter not found" });
      }

      const track = chapter.composition.content[input.where.trackId];
      if (!track || track.type !== "page") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Track not found" });
      }

      if (input.action === "updated") {
        const latestVersion = track.attrs.latestVersion;
        if (latestVersion !== input.data.version) return track;

        let doc = pageSchema.nodeFromJSON(track);
        const steps: object[] = [];

        for (const stepJSON of input.data.steps) {
          const step = Step.fromJSON(pageSchema, stepJSON);
          const { doc: updatedDoc } = step.apply(doc);
          if (!updatedDoc) return track;

          doc = updatedDoc;
          steps.push(input.data);
        }

        const message: DocumentTrackMessage = {
          action: "updated",
          where: input.where,
          data: { ...input.data, steps }
        };

        Object.assign(track, doc.toJSON());
        track.attrs.latestVersion = latestVersion + steps.length;
        track.attrs.deltas.push(message.data);
        track.attrs.deltas = track.attrs.deltas.slice(-1000);

        chapter.composition.content[input.where.trackId] = track;
        await chaptersAPI.update(input.where.chapterId, chapter);
        chaptersEmitter.emit("documentTrack", message);

        return message.data;
      } else if (input.action === "created") {
        chapter.composition.content[input.data.attrs.id] = input.data;
        await chaptersAPI.update(input.where.chapterId, chapter);
        return input.data;
      } else {
        delete chapter.composition.content[input.data.attrs.id];
        await chaptersAPI.update(input.where.chapterId, chapter);
        return input.data;
      }
    }),

  onDocumentTrackChange: procedure
    .input(input => input as DocumentTrackMessageWhere)
    .subscription(async function* ({ input, signal }) {
      for await (const [data] of on(chaptersEmitter, "documentTrack", { signal })) {
        const message = data as DocumentTrackMessage;
        if (message.where.trackId === input.where.trackId) yield message;
      }
    })
});

export { chapterRouter };
