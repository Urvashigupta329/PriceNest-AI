import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/apiErrors";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new ApiError(400, "Invalid request body", parsed.error.flatten())
      );
    }
    // Express' Request.body typing is broad; keep Zod as source of truth.
    req.body = parsed.data as any;
    return next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return next(
        new ApiError(400, "Invalid query parameters", parsed.error.flatten())
      );
    }
    // Express' Request.query typing is broad; keep Zod as source of truth.
    req.query = parsed.data as any;
    return next();
  };
}

