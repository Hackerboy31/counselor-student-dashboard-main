import type { RequestHandler } from "express";
import { NotFoundError } from "../errors";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError("NOT_FOUND", `Route not found: ${req.method} ${req.originalUrl}`));
};
