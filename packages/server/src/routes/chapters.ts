import { Chapter, DocumentTrackChangeMessage, DocumentTrackChange, pageSchema } from "@taep/core";
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

  documentTrackChange: procedure
    .input(input => {
      return input as DocumentTrackChangeMessage;
    })
    .mutation(async ({ input }) => {
      const { chapterId, trackId, change: trackChange } = input.data;

      const chapter = await chaptersAPI.read(chapterId);
      if (!chapter) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Chapter not found" });
      }

      const track = chapter.composition.content[trackId];
      if (!track || track.type !== "page") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Track not found" });
      }

      if (track.attrs.latestVersion !== trackChange.version) return track;

      let doc = pageSchema.nodeFromJSON(track);
      const changes: object[] = [];
      const clientIds: string[] = [];

      for (const stepJSON of trackChange.changes) {
        const step = Step.fromJSON(pageSchema, stepJSON);
        const { doc: updatedDoc } = step.apply(doc);
        if (!updatedDoc) return track;

        doc = updatedDoc;
        changes.push(trackChange);
        clientIds.push(trackChange.clientId);
      }

      const documentTrackChange: DocumentTrackChange = {
        clientId: trackChange.clientId,
        version: trackChange.version,
        changes
      };

      track.attrs.latestVersion = track.attrs.latestVersion + changes.length;
      track.attrs.changes.push(documentTrackChange);
      track.attrs.changes = track.attrs.changes.slice(-1000);
      await chaptersAPI.update(chapterId, chapter);

      const message: DocumentTrackChangeMessage = {
        action: "updated",
        data: { chapterId, trackId, change: documentTrackChange }
      };

      chaptersEmitter.emit("trackChange", message);
      return documentTrackChange;
    }),

  onDocumentTrackChange: procedure
    .input(input => {
      return input as {
        trackId: string;
      };
    })
    .subscription(async function* ({ input, signal }) {
      for await (const [data] of on(chaptersEmitter, "trackChange", { signal })) {
        const message = data as DocumentTrackChangeMessage;
        if (message.data.trackId === input.trackId) yield message;
      }
    })
});

export { chapterRouter };
