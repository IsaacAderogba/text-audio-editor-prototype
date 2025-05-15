import { Chapter, ChapterTrackMessage, DocumentTrackChange, pageSchema } from "@taep/core";
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

  trackChange: procedure
    .input(input => {
      return input as ChapterTrackMessage;
    })
    .mutation(async ({ input }) => {
      const { chapterId, trackId, change: trackChange } = input.data;

      const chapter = await chaptersAPI.read(chapterId);
      if (!chapter) return null;

      const track = chapter.composition.content[trackId];
      if (track.type !== "page") return track;
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

      const message: ChapterTrackMessage = {
        action: "updated",
        data: { chapterId, trackId, change: documentTrackChange }
      };

      chaptersEmitter.emit("trackChange", message);
      return message;
    }),

  onTrackChange: procedure.subscription(async function* (opts) {
    for await (const [data] of on(chaptersEmitter, "trackChange", { signal: opts.signal })) {
      yield data as ChapterTrackMessage;
    }
  })
});

/**
 * so, if i try to make a change that doesn't work,
 * should get the latest state and then use that...
 * it would be nice if it could handle it itself internally...
 */

// const authority = authorities.get(message.authorityId);
// if (!authority) return;
// try {
//   const version = authority.applyInput(message);
//   if (version !== undefined) {
//     socket.emit("message", authority.deriveOutput(version));
//   }
// } catch (err) {
//   console.error(err);
// }

// class Authority {
//   constructor(doc) {
//     this.doc = doc;
//     this.steps = [];
//     this.stepClientIDs = [];
//     this.onNewSteps = [];
//   }

//   receiveSteps(version, steps, clientID) {
//     if (version != this.steps.length) return;

//     // Apply and accumulate new steps
//     steps.forEach(step => {
//       this.doc = step.apply(this.doc).doc;
//       this.steps.push(step);
//       this.stepClientIDs.push(clientID);
//     });
//     // Signal listeners
//     this.onNewSteps.forEach(function (f) {
//       f();
//     });
//   }

//   stepsSince(version) {
//     return {
//       steps: this.steps.slice(version),
//       clientIDs: this.stepClientIDs.slice(version)
//     };
//   }
// }

// const authority = new Authority();

// function collabEditor(place) {
//   const view = new EditorView(place, {
//     state: EditorState.create({
//       doc: authority.doc,
//       plugins: [collab({ version: authority.steps.length })]
//     }),
//     dispatchTransaction(transaction) {
//       const newState = view.state.apply(transaction);
//       view.updateState(newState);
//       const sendable = sendableSteps(newState);
//       if (sendable) authority.receiveSteps(sendable.version, sendable.steps, sendable.clientID);
//     }
//   });

//   authority.onNewSteps.push(function () {
//     const newData = authority.stepsSince(getVersion(view.state));
//     view.dispatch(receiveTransaction(view.state, newData.steps, newData.clientIDs));
//   });

//   return view;
// }

export { chapterRouter };
