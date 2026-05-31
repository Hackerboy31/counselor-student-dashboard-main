import type { ErrorRequestHandler } from "express";
import type { ErrorEnvelope } from "@csac/shared";
import { AppError } from "../errors";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  res.setHeader("X-Request-Id", req.id);

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      req.log.error({ err, code: err.code }, err.message);
    } else {
      req.log.warn({ code: err.code, details: err.details }, err.message);
    }

    const body: ErrorEnvelope = {
      error: {
        code: err.code,
        message: err.message,
        requestId: req.id,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  req.log.error({ err }, "Unhandled error");
  const body: ErrorEnvelope = {
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
      requestId: req.id,
    },
  };
  res.status(500).json(body);
};
