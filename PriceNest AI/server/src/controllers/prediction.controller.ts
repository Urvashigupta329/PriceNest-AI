import { Request, Response } from "express";
import { predictPrice } from "../services/prediction.service";

export class PredictionController {
  static async predict(req: Request, res: Response) {
    const result = await predictPrice(req.body as any);
    return res.json(result);
  }
}

