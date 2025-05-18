import {
  AudioCompositionMessage,
  AudioTrack,
  Chapter,
  CompositionMessage,
  CompositionMessageWhere,
  MediaSegment,
  MediaTrack,
  MediaTrackDelta,
  PageCompositionMessage,
  PageTrack,
  Track,
  VideoCompositionMessage,
  VideoTrack,
  pageSchema
} from "@taep/core";
import { TRPCError } from "@trpc/server";
import { isAfter } from "date-fns";
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
      const { chapter, track } = await findChapterTrack<VideoTrack>("video", where);

      if (data.action === "updated") {
        const reconciled = reconcileMediaTrack(track, data.change);

        chapter.composition.content[where.trackId] = reconciled.track;
        await chaptersAPI.update(where.chapterId, chapter);
        chaptersEmitter.emit("composition", message);

        return reconciled.delta;
      } else if (data.action === "deleted") {
        delete chapter.composition.content[data.change.attrs.id];
        await chaptersAPI.update(where.chapterId, chapter);
        return data.change;
      } else {
        chapter.composition.content[data.change.attrs.id] = data.change;
        await chaptersAPI.update(where.chapterId, chapter);
        return data.change;
      }
    }),
  audioCompositionChange: procedure
    .input(input => input as AudioCompositionMessage)
    .mutation(async ({ input: message }) => {
      const { where, data } = message;
      const { chapter, track } = await findChapterTrack<AudioTrack>("audio", where);

      if (data.action === "updated") {
        const reconciled = reconcileMediaTrack(track, data.change);

        chapter.composition.content[where.trackId] = reconciled.track;
        await chaptersAPI.update(where.chapterId, chapter);
        chaptersEmitter.emit("composition", message);

        return reconciled.delta;
      } else if (data.action === "deleted") {
        delete chapter.composition.content[data.change.attrs.id];
        await chaptersAPI.update(where.chapterId, chapter);
        return data.change;
      } else {
        chapter.composition.content[data.change.attrs.id] = data.change;
        await chaptersAPI.update(where.chapterId, chapter);
        return data.change;
      }
    }),

  pageCompositionChange: procedure
    .input(input => input as PageCompositionMessage)
    .mutation(async ({ input: message }) => {
      const { data, where } = message;
      const { chapter, track } = await findChapterTrack<PageTrack>("page", where);

      if (data.action === "updated") {
        if (track.version !== data.change.version) return track;

        let doc = pageSchema.nodeFromJSON(track);

        for (const stepJSON of data.change.steps) {
          const step = Step.fromJSON(pageSchema, stepJSON);
          const { doc: updatedDoc } = step.apply(doc);
          if (!updatedDoc) return track;

          doc = updatedDoc;
        }

        Object.assign(track, doc.toJSON());
        track.version = track.version + data.change.steps.length;
        data.change.version = track.version;

        chapter.composition.content[where.trackId] = track;
        await chaptersAPI.update(where.chapterId, chapter);
        chaptersEmitter.emit("composition", message);

        return data.change;
      } else if (data.action === "deleted") {
        delete chapter.composition.content[data.change.attrs.id];
        await chaptersAPI.update(where.chapterId, chapter);
        return data.change;
      } else {
        chapter.composition.content[data.change.attrs.id] = data.change;
        await chaptersAPI.update(where.chapterId, chapter);
        return data.change;
      }
    }),

  onCompositionChange: procedure
    .input(input => input as { where: { chapterId: string } })
    .subscription(async function* ({ input, signal }) {
      for await (const [data] of on(chaptersEmitter, "composition", { signal })) {
        const message = data as CompositionMessage;
        if (message.where.chapterId === input.where.chapterId) yield message;
      }
    })
});

function reconcileMediaTrack<T extends MediaTrack, D extends MediaTrackDelta>(track: T, delta: D) {
  const reconciledSteps: D["steps"] = [];

  for (const step of delta.steps) {
    if (step.data.type === track.type) {
      Object.assign(track, step.data);
      reconciledSteps.push(step as any);
    } else {
      const data = track.content[step.data.attrs.id];
      const stale = data && isAfter(data.attrs.updatedAt, step.data.attrs.updatedAt);

      if (!stale && step.action === "deleted") {
        delete track.content[step.data.attrs.id];
        reconciledSteps.push(step as any);
      } else if (step.action === "created") {
        track.content[step.data.attrs.id] = step.data;
        reconciledSteps.push(step as any);
      } else {
        const segment = stale ? data : (step.data as MediaSegment);
        track.content[step.data.attrs.id] = segment;
        reconciledSteps.push({ ...step, action: "updated", data: segment } as any);
      }
    }
  }

  track.version = track.version + reconciledSteps.length;
  delta.version = track.version;
  delta.steps = reconciledSteps;

  return { track, delta };
}

const findChapterTrack = async <T extends Track>(
  type: T["type"],
  where: CompositionMessageWhere
) => {
  const chapter = await chaptersAPI.read(where.chapterId);
  if (!chapter) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Chapter not found" });
  }

  const track = chapter.composition.content[where.trackId];
  if (!track || track.type !== type) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Track not found" });
  }

  return { chapter, track: track as T };
};

export { chapterRouter };
