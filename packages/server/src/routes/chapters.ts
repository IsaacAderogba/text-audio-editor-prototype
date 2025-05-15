import { Chapter, ChapterTrackMessage, pageSchema, WebsocketMessage } from "@taep/core";
import { cloneDeep } from "lodash-es";
import { Step } from "prosemirror-transform";
import { WebSocket } from "ws";
import { createDatabaseAdapter } from "../services/database.js";
import { procedure, router } from "../utilities/trpc.js";

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
    })
});

export const chapterWSRouter = (socket: WebSocket, message: WebsocketMessage) => {
  switch (message.channel) {
    case "chapterTrack":
      return socket.emit(message.channel, handleChapterTrackMessage(message));
  }

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
};

const handleChapterTrackMessage = async (
  message: ChapterTrackMessage
): Promise<ChapterTrackMessage> => {
  const { chapterId, trackId, change } = message.chapterTrack.data;
  const unacknowledgedMessage = cloneDeep(message);
  unacknowledgedMessage.chapterTrack.data.change.acknowledged = false;

  const chapter = await chaptersAPI.read(chapterId);
  if (!chapter) return unacknowledgedMessage;

  const track = chapter.composition.content[trackId];
  if (track.type !== "page") return unacknowledgedMessage;

  let doc = pageSchema.nodeFromJSON(track);
  const changes: object[] = [];
  const clientIds: string[] = [];

  for (let i = 0; i++; i < change.changes.length) {
    const [stepJSON, clientId] = [change.changes[i], change.clientIds[i]];
    const step = Step.fromJSON(pageSchema, stepJSON);
    const { doc: updatedDoc } = step.apply(doc);
    if (!updatedDoc) return unacknowledgedMessage;

    doc = updatedDoc;
    changes.push(change);
    clientIds.push(clientId);
  }

  return {
    channel: "chapterTrack",
    chapterTrack: {
      action: "updated",
      data: {
        chapterId,
        trackId,
        change: { acknowledged: true, changes, clientIds, version: change.version }
      }
    }
  };
};

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
