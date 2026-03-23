import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

import { env } from "./config/env";
import { authRoutes } from "./routes/auth.routes";
import { propertyRoutes } from "./routes/property.routes";
import { favoritesRoutes } from "./routes/favorites.routes";
import { predictionRoutes } from "./routes/prediction.routes";
import { analyticsRoutes } from "./routes/analytics.routes";
import { errorHandler } from "./middleware/errorHandler";

export function createServer() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      // In development, the frontend may come up on a different port (5173/5174/etc).
      // Allow the request origin so browser requests don't fail with a generic "Authentication failed".
      origin: env.NODE_ENV === "development" ? true : env.CLIENT_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

  app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/properties", propertyRoutes);
  app.use("/api/favorites", favoritesRoutes);
  app.use("/api/predict", predictionRoutes);
  app.use("/api/analytics", analyticsRoutes);

  app.use(errorHandler);

  return app;
}

