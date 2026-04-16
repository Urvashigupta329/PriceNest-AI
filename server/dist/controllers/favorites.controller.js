"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoritesController = void 0;
const favorites_service_1 = require("../services/favorites.service");
class FavoritesController {
    static async list(req, res) {
        const userId = req.user.id;
        const properties = await (0, favorites_service_1.listFavorites)(userId);
        return res.json({ properties });
    }
    static async add(req, res) {
        const userId = req.user.id;
        const { propertyId } = req.params;
        const result = await (0, favorites_service_1.addFavorite)(userId, propertyId);
        return res.status(201).json(result);
    }
    static async remove(req, res) {
        const userId = req.user.id;
        const { propertyId } = req.params;
        await (0, favorites_service_1.removeFavorite)(userId, propertyId);
        return res.status(204).send();
    }
}
exports.FavoritesController = FavoritesController;
