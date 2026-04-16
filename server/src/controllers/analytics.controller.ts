import { Request, Response } from "express";
import { getTrend } from "../services/analytics.service";

export class AnalyticsController {
  static async trend(req: Request, res: Response) {
    const { location, months } = req.query as any;
    const data = await getTrend(location, months ?? 12);
    return res.json({ trend: data });
  }
}

