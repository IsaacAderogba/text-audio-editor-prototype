import _cors, { CorsOptions } from "cors";
import { NextFunction, Request, Response } from "express";

const allowedOrigins = [
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://localhost:4000",
  "http://localhost:3000"
];

export const corsOptions: CorsOptions = {
  optionsSuccessStatus: 200,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by cors"));
    }
  }
};

export const cors = () => {
  return _cors(corsOptions);
};

export const credentials = () => (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", "true");
  }

  next();
};
