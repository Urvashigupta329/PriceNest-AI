import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/apiErrors";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: "user" | "admin" };
    }
  }
}

function parseBearer(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const [scheme, token] = auth.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = parseBearer(req);
  if (!token) return next(new ApiError(401, "Missing Authorization Bearer token"));

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      role: "user" | "admin";
    };
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (_e) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return next(new ApiError(401, "Not authenticated"));
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  return next();
}

