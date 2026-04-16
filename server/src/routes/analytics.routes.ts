import { Router } from "express";
import { validateQuery } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { analyticsQuerySchema } from "../services/analytics.service";
import { AnalyticsController } from "../controllers/analytics.controller";

export const analyticsRoutes = Router();

analyticsRoutes.get(
  "/trend",
  validateQuery(analyticsQuerySchema),
  asyncHandler((req, res) => AnalyticsController.trend(req, res))
);

