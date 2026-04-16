import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { ApiError } from "../utils/apiErrors";

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new ApiError(400, "Invalid request body", parsed.error.flatten())
      );
    }
    req.body = parsed.data as any;
    return next();
  };
}

export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return next(
        new ApiError(400, "Invalid query parameters", parsed.error.flatten())
      );
    }
    req.query = parsed.data as any;
    return next();
  };
}

