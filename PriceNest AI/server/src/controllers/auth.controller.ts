import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";

export class AuthController {
  static async register(req: Request, res: Response) {
    const result = await registerUser(req.body);
    return res.status(201).json(result);
  }

  static async login(req: Request, res: Response) {
    const result = await loginUser(req.body);
    return res.status(200).json(result);
  }
}

