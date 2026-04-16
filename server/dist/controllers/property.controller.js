"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyController = void 0;
const property_service_1 = require("../services/property.service");
class PropertyController {
    static async list(req, res) {
        const { location, minPrice, maxPrice, bhk } = req.query;
        const props = await (0, property_service_1.listProperties)({
            location,
            minPrice,
            maxPrice,
            bhk
        });
        return res.json({ properties: props });
    }
    static async getById(req, res) {
        const { id } = req.params;
        const prop = await (0, property_service_1.getPropertyById)(id);
        const recommendations = await (0, property_service_1.getRecommendationsForProperty)(id, 6);
        return res.json({ property: prop, recommendations });
    }
    static async recommendations(req, res) {
        const { id } = req.params;
        const { limit } = req.query;
        const recs = await (0, property_service_1.getRecommendationsForProperty)(id, limit ?? 6);
        return res.json({ recommendations: recs });
    }
    static async searchNatural(req, res) {
        const { query } = req.query;
        const props = await (0, property_service_1.searchNatural)(query);
        return res.json({ properties: props });
    }
    static async create(req, res) {
        const created = await (0, property_service_1.createProperty)(req.body);
        return res.status(201).json(created);
    }
    static async update(req, res) {
        const { id } = req.params;
        const updated = await (0, property_service_1.updateProperty)(id, req.body);
        return res.json(updated);
    }
    static async remove(req, res) {
        const { id } = req.params;
        await (0, property_service_1.removeProperty)(id);
        return res.status(204).send();
    }
}
exports.PropertyController = PropertyController;
