import {
  AudioCompositionMessage,
  Chapter,
  CompositionMessage,
  CompositionMessageWhere,
  PageCompositionMessage,
  VideoCompositionMessage,
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

  videoCompositionChange: procedure
    .input(input => input as VideoCompositionMessage)
    .mutation(async ({ input: message }) => {
      const { where, data } = message;
      const chapter = await chaptersAPI.read(where.chapterId);
      if (!chapter) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Chapter not found" });
      }

      const track = chapter.composition.content[where.trackId];
      if (!track || track.type !== "video") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video track not found" });
      }

      if (data.action === "updated") {
        const latestVersion = track.attrs.latestVersion;
        if (latestVersion !== data.change.version) return track;

        for (const step of data.change.steps) {
          if (step.data.type === "video") {
            Object.assign(track, step.data);
          } else if (step.action === "deleted") {
            delete track.content[step.data.attrs.id];
          } else {
            track.content[step.data.attrs.id] = step.data;
          }
        }

        track.attrs.latestVersion = latestVersion + data.change.steps.length;
        track.attrs.deltas.push(data.change);
        track.attrs.deltas = track.attrs.deltas.slice(-1000);

        chapter.composition.content[where.trackId] = track;
        await chaptersAPI.update(where.chapterId, chapter);
        chaptersEmitter.emit("composition", message);

        return data.change;
      } else if (data.action === "created") {
        chapter.composition.content[data.change.attrs.id] = data.change;
        await chaptersAPI.update(where.chapterId, chapter);
        return data.change;
      } else {
        delete chapter.composition.content[data.change.attrs.id];
        await chaptersAPI.update(where.chapterId, chapter);
        return data.change;
      }
    }),
  audioCompositionChange: procedure
    .input(input => input as AudioCompositionMessage)
    .mutation(async ({ input: message }) => {
      const { where, data } = message;
      const chapter = await chaptersAPI.read(where.chapterId);
      if (!chapter) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Chapter not found" });
      }

      const track = chapter.composition.content[where.trackId];
      if (!track || track.type !== "audio") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video track not found" });
      }

      if (data.action === "updated") {
        const latestVersion = track.attrs.latestVersion;
        if (latestVersion !== data.change.version) return track;

        for (const step of data.change.steps) {
          if (step.data.type === "audio") {
            Object.assign(track, step.data);
          } else if (step.action === "deleted") {
            delete track.content[step.data.attrs.id];
          } else {
            track.content[step.data.attrs.id] = step.data;
          }
        }

        track.attrs.latestVersion = latestVersion + data.change.steps.length;
        track.attrs.deltas.push(data.change);
        track.attrs.deltas = track.attrs.deltas.slice(-1000);

        chapter.composition.content[where.trackId] = track;
        await chaptersAPI.update(where.chapterId, chapter);
        chaptersEmitter.emit("composition", message);

        return data.change;
      } else if (data.action === "created") {
        chapter.composition.content[data.change.attrs.id] = data.change;
        await chaptersAPI.update(where.chapterId, chapter);
        return data.change;
      } else {
        delete chapter.composition.content[data.change.attrs.id];
        await chaptersAPI.update(where.chapterId, chapter);
        return data.change;
      }
    }),

  pageCompositionChange: procedure
    .input(input => input as PageCompositionMessage)
    .mutation(async ({ input: message }) => {
      const { data, where } = message;
      const chapter = await chaptersAPI.read(where.chapterId);
      if (!chapter) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Chapter not found" });
      }

      const track = chapter.composition.content[where.trackId];
      if (!track || track.type !== "page") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Page track not found" });
      }

      if (data.action === "updated") {
        const latestVersion = track.attrs.latestVersion;
        if (latestVersion !== data.change.version) return track;

        let doc = pageSchema.nodeFromJSON(track);

        for (const stepJSON of data.change.steps) {
          const step = Step.fromJSON(pageSchema, stepJSON);
          const { doc: updatedDoc } = step.apply(doc);
          if (!updatedDoc) return track;

          doc = updatedDoc;
        }

        Object.assign(track, doc.toJSON());
        track.attrs.latestVersion = latestVersion + data.change.steps.length;
        track.attrs.deltas.push(data.change);
        track.attrs.deltas = track.attrs.deltas.slice(-1000);

        chapter.composition.content[where.trackId] = track;
        await chaptersAPI.update(where.chapterId, chapter);
        chaptersEmitter.emit("composition", message);

        return data.change;
      } else if (data.action === "created") {
        chapter.composition.content[data.change.attrs.id] = data.change;
        await chaptersAPI.update(where.chapterId, chapter);
        return data.change;
      } else {
        delete chapter.composition.content[data.change.attrs.id];
        await chaptersAPI.update(where.chapterId, chapter);
        return data.change;
      }
    }),

  onCompositionChange: procedure
    .input(input => input as { where: CompositionMessageWhere })
    .subscription(async function* ({ input, signal }) {
      for await (const [data] of on(chaptersEmitter, "composition", { signal })) {
        const message = data as CompositionMessage;
        if (message.where.trackId === input.where.trackId) yield message;
      }
    })
});

export { chapterRouter };
