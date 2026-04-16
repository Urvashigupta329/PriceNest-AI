import { Router } from "express";
import { validateBody, validateQuery } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { PropertyController } from "../controllers/property.controller";
import {
  createPropertySchema,
  updatePropertySchema,
  listPropertiesQuerySchema,
  naturalSearchQuerySchema,
  recommendationsQuerySchema
} from "../services/property.service";

export const propertyRoutes = Router();

propertyRoutes.get(
  "/",
  validateQuery(listPropertiesQuerySchema),
  asyncHandler((req, res) => PropertyController.list(req, res))
);

propertyRoutes.get(
  "/search-natural",
  validateQuery(naturalSearchQuerySchema),
  asyncHandler((req, res) => PropertyController.searchNatural(req, res))
);

propertyRoutes.get(
  "/:id",
  asyncHandler((req, res) => PropertyController.getById(req, res))
);

propertyRoutes.get(
  "/:id/recommendations",
  validateQuery(recommendationsQuerySchema),
  asyncHandler((req, res) => PropertyController.recommendations(req, res))
);

propertyRoutes.post(
  "/",
  requireAuth,
  requireAdmin,
  validateBody(createPropertySchema),
  asyncHandler((req, res) => PropertyController.create(req, res))
);

propertyRoutes.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validateBody(updatePropertySchema),
  asyncHandler((req, res) => PropertyController.update(req, res))
);

propertyRoutes.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler((req, res) => PropertyController.remove(req, res))
);

