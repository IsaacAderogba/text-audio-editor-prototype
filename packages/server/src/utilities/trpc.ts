import { initTRPC } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import { ZodError } from "zod";

export const createHTTPContext = ({ req, res, info }: CreateExpressContextOptions) => {
  return { req, res, info };
};
export type HTTPContext = Awaited<ReturnType<typeof createHTTPContext>>;

export const createWSContext = ({ req, res, info }: CreateWSSContextFnOptions) => {
  return { req, res, info };
};
export type WSContext = Awaited<ReturnType<typeof createWSContext>>;

const t = initTRPC.context<HTTPContext>().create({
  errorFormatter(opts) {
    const { shape, error } = opts;

    const message =
      error.cause instanceof ZodError
        ? error.cause.issues.map(z => `${z.message} (${z.path.join(".")})`).join("; ")
        : error.message;

    return { ...shape, message };
  }
});

export const router = t.router;
export const middleware = t.middleware;
export const procedure = t.procedure;
