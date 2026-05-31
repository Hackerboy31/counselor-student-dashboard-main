import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { logger } from "../../lib/logger";

const REQUEST_ID_HEADER = "x-request-id";

export const requestId: RequestHandler = (req, res, next) => {
  const inbound = req.header(REQUEST_ID_HEADER)?.trim();
  const id = inbound && inbound.length > 0 ? inbound : randomUUID();

  req.id = id;
  res.setHeader("X-Request-Id", id);
  req.log = logger.child({ requestId: id });

  next();
};
