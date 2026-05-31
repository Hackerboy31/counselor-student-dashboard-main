import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { ValidationError } from "../errors";

type RequestSource = "body" | "params" | "query";

export function validate(schema: ZodTypeAny, source: RequestSource = "body"): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(new ValidationError(`Invalid request ${source}.`, result.error.flatten()));
      return;
    }
    Object.assign(req, { [source]: result.data });
    next();
  };
}
