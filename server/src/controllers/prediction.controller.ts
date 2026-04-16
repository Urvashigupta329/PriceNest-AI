import { Request, Response } from "express";
import { predictPrice } from "../services/prediction.service";

export class PredictionController {
  static async predict(req: Request, res: Response) {
    console.log("[CONTROLLER] POST /api/predict received");
    console.log("[CONTROLLER] Input payload:", JSON.stringify(req.body));
    
    try {
      const result = await predictPrice(req.body as any);
      console.log("[CONTROLLER] Prediction successful, sending result:", result);
      return res.json(result);
    } catch (error: any) {
      console.error("[CONTROLLER] Prediction failed:", error);
      throw error; // Let error handler catch it
    }
  }
}

