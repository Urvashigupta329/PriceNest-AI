import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { FavoritesController } from "../controllers/favorites.controller";

export const favoritesRoutes = Router();

favoritesRoutes.use(requireAuth);

favoritesRoutes.get(
  "/",
  asyncHandler((req, res) => FavoritesController.list(req, res))
);

favoritesRoutes.post(
  "/:propertyId",
  asyncHandler((req, res) => FavoritesController.add(req, res))
);

favoritesRoutes.delete(
  "/:propertyId",
  asyncHandler((req, res) => FavoritesController.remove(req, res))
);

