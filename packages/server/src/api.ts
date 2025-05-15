import * as trpcExpress from "@trpc/server/adapters/express";
import { applyWSSHandler } from "@trpc/server/dist/adapters/ws.js";
import cookieParser from "cookie-parser";
import express, { json } from "express";
import http from "http";
import ws from "ws";
import { chapterRouter } from "./routes/chapters.js";
import { projectRouter } from "./routes/projects.js";
import { cors, credentials } from "./utilities/cors.js";
import { createHTTPContext, createWSContext, router } from "./utilities/trpc";

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

  const server = http.createServer(app);
  server.listen(port, () => {
    console.log(`✅ HTTP server listening on port ${port}\n`);
  });

  const wsServer = new ws.Server({ server });
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
  });

  console.log(`✅ WebSocket server listening on ${port}`);
  process.on("SIGTERM", () => {
    console.log("SIGTERM");
    handler.broadcastReconnectNotification();
    wsServer.close();
  });

  return server;
};

type APIRouter = typeof apiRouter;

export { startApi };
export type { APIRouter };
