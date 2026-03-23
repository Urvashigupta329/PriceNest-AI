import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiErrors";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const anyErr = err as Partial<ApiError> & { message?: string };

  if (anyErr instanceof ApiError) {
    return res
      .status(anyErr.statusCode)
      .json({ error: anyErr.message, details: anyErr.details });
  }

  // Mongoose / casting issues often land here
  return res.status(500).json({
    error: "Internal server error",
    details: anyErr.message
  });
}

