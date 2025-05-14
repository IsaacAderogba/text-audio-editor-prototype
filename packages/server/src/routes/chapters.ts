import { Chapter, WebsocketMessage } from "@taep/core";
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

export { chapterRouter };
