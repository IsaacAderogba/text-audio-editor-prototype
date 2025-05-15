import { createTRPCClient, createWSClient, httpBatchLink, wsLink } from "@trpc/client";
import type { APIRouter } from "../../../server/src";

const wsClient = createWSClient({
  url: `ws://localhost:4000/api`,
  connectionParams: async () => ({})
});

export const trpc = createTRPCClient<APIRouter>({
  links: [
    httpBatchLink({
      url: `http://localhost:4000/api`,
      fetch(url, options) {
        return fetch(url, { ...options, credentials: "include" });
      }
    }),
    wsLink({ client: wsClient })
  ]
});
