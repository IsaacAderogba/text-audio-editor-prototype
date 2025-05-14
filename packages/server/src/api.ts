import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import express, { json } from "express";
import http from "http";
import { chapterRouter, chapterWSRouter } from "./routes/chapters.js";
import { projectRouter, projectWSRouter } from "./routes/projects.js";
import { createHTTPContext, createWSContext, router } from "./utilities/trpc";
import { cors, credentials } from "./utilities/cors.js";
import ws from "ws";
import { applyWSSHandler } from "@trpc/server/dist/adapters/ws.js";
import { WebsocketMessage } from "@taep/core";

const apiRouter = router({
  project: projectRouter,
  chapter: chapterRouter
});

const startApi = async (port: number) => {
  const app = express();

  app.use(credentials());
  app.use(cors());
  app.use(json({ limit: "10mb" }));
  app.use(cookieParser());

  app.use(
    "/api",
    trpcExpress.createExpressMiddleware({ router: apiRouter, createContext: createHTTPContext })
  );

  const httpServer = http.createServer(app);
  httpServer.listen(port, () => {
    console.log(`✅ HTTP server listening on port ${port}\n`);
  });

  const wsServer = new ws.Server({ port });
  const handler = applyWSSHandler({
    wss: wsServer,
    router: apiRouter,
    // @ts-expect-error - todo
    createContext: createWSContext,
    keepAlive: { enabled: true, pingMs: 30000, pongWaitMs: 5000 }
  });

  wsServer.on("connection", socket => {
    console.log(`🔗 connected (${wsServer.clients.size})`);

    socket.once("close", () => {
      console.log(`🔗 disconnected (${wsServer.clients.size})`);
    });

    socket.on("message", (message: WebsocketMessage) => {
      console.log(`[message]:`, message);

      projectWSRouter(socket, message);
      chapterWSRouter(socket, message);
    });
  });

  console.log(`✅ WebSocket server listening on ${port}`);
  process.on("SIGTERM", () => {
    console.log("SIGTERM");
    handler.broadcastReconnectNotification();
    wsServer.close();
  });

  return httpServer;
};

type APIRouter = typeof apiRouter;

export { startApi };
export type { APIRouter };
