import { Request, Response } from "express";
import { addFavorite, listFavorites, removeFavorite } from "../services/favorites.service";

export class FavoritesController {
  static async list(req: Request, res: Response) {
    const userId = req.user!.id;
    const properties = await listFavorites(userId);
    return res.json({ properties });
  }

  static async add(req: Request, res: Response) {
    const userId = req.user!.id;
    const { propertyId } = req.params;
    const result = await addFavorite(userId, propertyId);
    return res.status(201).json(result);
  }

  static async remove(req: Request, res: Response) {
    const userId = req.user!.id;
    const { propertyId } = req.params;
    await removeFavorite(userId, propertyId);
    return res.status(204).send();
  }
}

