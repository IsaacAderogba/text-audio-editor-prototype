import {
  Chapter,
  DocumentTrackDelta,
  DocumentTrackMessage,
  DocumentTrackMessageWhere,
  MediaTrackMessage,
  MediaTrackMessageWhere,
  pageSchema
} from "@taep/core";
import { EventEmitter, on } from "events";
import { Step } from "prosemirror-transform";
import { createDatabaseAdapter } from "../services/database.js";
import { procedure, router } from "../utilities/trpc.js";
import { TRPCError } from "@trpc/server";

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

      if (input.data.type === "delta") {
        if (track.attrs.latestVersion !== input.data.version) return track;

        let doc = pageSchema.nodeFromJSON(track);
        const steps: object[] = [];
        const clientIds: string[] = [];

        for (const stepJSON of input.data.steps) {
          const step = Step.fromJSON(pageSchema, stepJSON);
          const { doc: updatedDoc } = step.apply(doc);
          if (!updatedDoc) return track;

          doc = updatedDoc;
          steps.push(input.data);
          clientIds.push(input.data.clientId);
        }

        const documentTrackDelta: DocumentTrackDelta = { ...input.data, steps };

        track.attrs.latestVersion = track.attrs.latestVersion + steps.length;
        track.attrs.deltas.push(documentTrackDelta);
        track.attrs.deltas = track.attrs.deltas.slice(-1000);
        await chaptersAPI.update(input.where.chapterId, chapter);

        const message: DocumentTrackMessage = {
          action: "updated",
          where: input.where,
          data: documentTrackDelta
        };

        chaptersEmitter.emit("documentTrack", message);
        return documentTrackDelta;
      } else {
        chapter.composition.content[input.data.attrs.id] = input.data;
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
