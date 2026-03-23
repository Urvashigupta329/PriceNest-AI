import { Request, Response } from "express";
import {
  createProperty,
  getPropertyById,
  getPropertyHistoryTrend,
  getRecommendationsForProperty,
  listProperties,
  naturalSearchQuerySchema,
  parseNaturalSearchText,
  removeProperty,
  searchNatural,
  updateProperty
} from "../services/property.service";
import { ApiError } from "../utils/apiErrors";

export class PropertyController {
  static async list(req: Request, res: Response) {
    const { location, minPrice, maxPrice, bhk } = req.query as any;
    const props = await listProperties({
      location,
      minPrice,
      maxPrice,
      bhk
    });
    return res.json({ properties: props });
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    const prop = await getPropertyById(id);
    const recommendations = await getRecommendationsForProperty(id, 6);
    return res.json({ property: prop, recommendations });
  }

  static async recommendations(req: Request, res: Response) {
    const { id } = req.params;
    const { limit } = req.query as any;
    const recs = await getRecommendationsForProperty(id, limit ?? 6);
    return res.json({ recommendations: recs });
  }

  static async searchNatural(req: Request, res: Response) {
    const { query } = req.query as any;
    const props = await searchNatural(query);
    return res.json({ properties: props });
  }

  static async create(req: Request, res: Response) {
    const created = await createProperty(req.body as any);
    return res.status(201).json(created);
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const updated = await updateProperty(id, req.body as any);
    return res.json(updated);
  }

  static async remove(req: Request, res: Response) {
    const { id } = req.params;
    await removeProperty(id);
    return res.status(204).send();
  }
}

