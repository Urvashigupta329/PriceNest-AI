import { Router } from "express";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { PredictionController } from "../controllers/prediction.controller";
import { predictSchema } from "../services/prediction.service";

export const predictionRoutes = Router();

predictionRoutes.post(
  "/",
  validateBody(predictSchema),
  asyncHandler((req, res) => PredictionController.predict(req, res))
);

