import { Router } from "express";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthController } from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../services/auth.service";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  validateBody(registerSchema),
  asyncHandler((req, res) => AuthController.register(req, res))
);

authRoutes.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler((req, res) => AuthController.login(req, res))
);

