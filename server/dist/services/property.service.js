"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.naturalSearchQuerySchema = exports.updatePropertySchema = exports.createPropertySchema = exports.recommendationsQuerySchema = exports.listPropertiesQuerySchema = void 0;
exports.parseNaturalSearchText = parseNaturalSearchText;
exports.listProperties = listProperties;
exports.getPropertyById = getPropertyById;
exports.createProperty = createProperty;
exports.updateProperty = updateProperty;
exports.removeProperty = removeProperty;
exports.searchNatural = searchNatural;
exports.getRecommendationsForProperty = getRecommendationsForProperty;
exports.getPropertyHistoryTrend = getPropertyHistoryTrend;
const zod_1 = require("zod");
const apiErrors_1 = require("../utils/apiErrors");
const property_model_1 = require("../models/property.model");
const mongoose_1 = require("mongoose");
exports.listPropertiesQuerySchema = zod_1.z.object({
    location: zod_1.z.string().trim().min(1).optional(),
    minPrice: zod_1.z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : undefined))
        .refine((v) => v === undefined || !Number.isNaN(v), {
        message: "minPrice must be a number"
    })
        .optional(),
    maxPrice: zod_1.z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : undefined))
        .refine((v) => v === undefined || !Number.isNaN(v), {
        message: "maxPrice must be a number"
    })
        .optional(),
    bhk: zod_1.z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : undefined))
        .refine((v) => v === undefined || !Number.isNaN(v), {
        message: "bhk must be a number"
    })
        .optional()
});
exports.recommendationsQuerySchema = zod_1.z.object({
    limit: zod_1.z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : 6))
        .refine((n) => Number.isFinite(n) && n > 0 && n <= 20, {
        message: "limit must be between 1 and 20"
    })
        .optional()
});
exports.createPropertySchema = zod_1.z.object({
    location: zod_1.z.string().trim().min(2).max(80),
    area: zod_1.z.number().min(1),
    bedrooms: zod_1.z.number().min(0),
    bathrooms: zod_1.z.number().min(0),
    price: zod_1.z.number().min(0),
    title: zod_1.z.string().trim().min(3).max(120),
    address: zod_1.z.string().trim().max(200).optional(),
    imageUrl: zod_1.z.string().trim().url().optional(),
    description: zod_1.z.string().trim().max(2000).optional(),
    history: zod_1.z
        .array(zod_1.z.object({
        date: zod_1.z
            .string()
            .or(zod_1.z.date())
            .transform((d) => new Date(d)),
        price: zod_1.z.number().min(0)
    }))
        .optional()
});
exports.updatePropertySchema = exports.createPropertySchema
    .partial()
    .refine((obj) => Object.keys(obj).length > 0, { message: "No fields provided" });
exports.naturalSearchQuerySchema = zod_1.z.object({
    query: zod_1.z.string().trim().min(3).max(200)
});
function parsePriceFromText(text) {
    const t = text.toLowerCase();
    // Examples:
    // "under 50 lakh", "below 1 crore", "max 2500000"
    const lakh = t.match(/(under|below|max)\s*([0-9]+(\.[0-9]+)?)\s*(lakh|lakhs)\b/);
    if (lakh)
        return Number(lakh[2]) * 100000;
    const crore = t.match(/(under|below|max)\s*([0-9]+(\.[0-9]+)?)\s*(crore|crores)\b/);
    if (crore)
        return Number(crore[2]) * 10000000;
    const rupees = t.match(/(under|below|max)\s*([0-9]+(\.[0-9]+)?)\b/);
    if (rupees)
        return Number(rupees[2]);
    return undefined;
}
function parseBedroomsFromText(text) {
    const m = text.match(/([0-9]+)\s*bhk\b/i);
    if (!m)
        return undefined;
    return Number(m[1]);
}
function parseLocationFromText(text) {
    // Try patterns: "in <location>" or "at <location>"
    const m = text.match(/\b(in|at)\s+([a-zA-Z0-9\s,-]{2,60})/i);
    if (!m)
        return undefined;
    const loc = m[2].trim();
    return loc.length ? loc : undefined;
}
function parseNaturalSearchText(query) {
    const bedrooms = parseBedroomsFromText(query);
    const maxPrice = parsePriceFromText(query);
    const location = parseLocationFromText(query);
    return { bedrooms, maxPrice, location };
}
async function listProperties(params) {
    const filter = {};
    if (params.location)
        filter.location = new RegExp(params.location, "i");
    if (typeof params.minPrice === "number")
        filter.price = { ...filter.price, $gte: params.minPrice };
    if (typeof params.maxPrice === "number")
        filter.price = { ...filter.price, $lte: params.maxPrice };
    if (typeof params.bhk === "number")
        filter.bedrooms = { $gte: params.bhk, $lte: params.bhk };
    const props = await property_model_1.PropertyModel.find(filter)
        .sort({ price: 1 })
        .limit(200)
        .lean();
    return props;
}
async function getPropertyById(id) {
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw new apiErrors_1.ApiError(400, "Invalid property id");
    const prop = await property_model_1.PropertyModel.findById(id).lean();
    if (!prop)
        throw new apiErrors_1.ApiError(404, "Property not found");
    return prop;
}
async function createProperty(input) {
    return property_model_1.PropertyModel.create(input);
}
async function updateProperty(id, input) {
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw new apiErrors_1.ApiError(400, "Invalid property id");
    const updated = await property_model_1.PropertyModel.findByIdAndUpdate(id, input, { new: true });
    if (!updated)
        throw new apiErrors_1.ApiError(404, "Property not found");
    return updated;
}
async function removeProperty(id) {
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw new apiErrors_1.ApiError(400, "Invalid property id");
    const deleted = await property_model_1.PropertyModel.findByIdAndDelete(id);
    if (!deleted)
        throw new apiErrors_1.ApiError(404, "Property not found");
    return { ok: true };
}
async function searchNatural(query) {
    const parsed = parseNaturalSearchText(query);
    const filter = {};
    if (parsed.location)
        filter.location = new RegExp(parsed.location, "i");
    if (typeof parsed.maxPrice === "number")
        filter.price = { $lte: parsed.maxPrice };
    if (typeof parsed.bedrooms === "number")
        filter.bedrooms = parsed.bedrooms;
    return property_model_1.PropertyModel.find(filter).sort({ price: 1 }).limit(100).lean();
}
function similarityScore(target, other) {
    const locationMatch = String(target.location).toLowerCase() === String(other.location).toLowerCase() ? 1 : 0;
    const areaRel = Math.abs(target.area - other.area) / Math.max(target.area, other.area, 1);
    const bedroomsRel = Math.abs(target.bedrooms - other.bedrooms) / Math.max(target.bedrooms, other.bedrooms, 1);
    const bathroomsRel = Math.abs(target.bathrooms - other.bathrooms) / Math.max(target.bathrooms, other.bathrooms, 1);
    // Convert relative diffs into bounded similarity
    const areaSim = 1 / (1 + areaRel);
    const bedSim = 1 / (1 + bedroomsRel);
    const bathSim = 1 / (1 + bathroomsRel);
    return locationMatch * 2.5 + areaSim * 1.5 + bedSim * 1.2 + bathSim * 1.0;
}
async function getRecommendationsForProperty(propertyId, limit = 6) {
    const target = await property_model_1.PropertyModel.findById(propertyId).lean();
    if (!target)
        throw new apiErrors_1.ApiError(404, "Property not found");
    const others = await property_model_1.PropertyModel.find({ _id: { $ne: target._id } })
        .select("location area bedrooms bathrooms price title imageUrl address history")
        .lean();
    const scored = others
        .map((p) => ({ p, score: similarityScore(target, p) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ p }) => p);
    return scored;
}
async function getPropertyHistoryTrend(location, maxMonths = 12) {
    const props = await property_model_1.PropertyModel.find({ location: new RegExp(location, "i") }).lean();
    if (!props.length)
        return [];
    // Group all history entries by month
    const monthMap = new Map();
    for (const p of props) {
        for (const h of p.history ?? []) {
            const d = new Date(h.date);
            const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
            const current = monthMap.get(key) ?? { sum: 0, count: 0 };
            current.sum += h.price;
            current.count += 1;
            monthMap.set(key, current);
        }
    }
    const points = [...monthMap.entries()]
        .map(([key, v]) => {
        const [y, m] = key.split("-").map((x) => Number(x));
        return {
            date: new Date(Date.UTC(y, m - 1, 1)),
            price: v.sum / Math.max(v.count, 1)
        };
    })
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(-maxMonths);
    return points.map((p) => ({ date: p.date.toISOString(), price: Math.round(p.price) }));
}
