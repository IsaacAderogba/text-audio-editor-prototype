import { Project, WebsocketMessage } from "@taep/core";
import { WebSocket } from "ws";
import { createDatabaseAdapter } from "../services/database.js";
import { procedure, router } from "../utilities/trpc.js";

export const projectsAPI = createDatabaseAdapter("projects");

const projectRouter = router({
  read: procedure
    .input(input => {
      return input as {
        id: string;
      };
    })
    .query(({ input }) => {
      return projectsAPI.read(input.id);
    }),

  list: procedure.query(() => {
    return projectsAPI.list();
  }),

  create: procedure
    .input(input => {
      return input as {
        data: Project;
      };
    })
    .mutation(({ input }) => {
      return projectsAPI.create(input.data);
    }),

  update: procedure
    .input(input => {
      return input as {
        id: string;
        data: Partial<Project>;
      };
    })
    .mutation(({ input }) => {
      return projectsAPI.update(input.id, input.data);
    }),

  delete: procedure
    .input(input => {
      return input as {
        id: string;
      };
    })
    .mutation(({ input }) => {
      return projectsAPI.delete(input.id);
    })
});

export const projectWSRouter = (socket: WebSocket, message: WebsocketMessage) => {
  // todo
};

export { projectRouter };
