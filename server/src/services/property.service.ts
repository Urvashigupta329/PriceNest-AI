import { z } from "zod";
import { ApiError } from "../utils/apiErrors";
import { PropertyModel } from "../models/property.model";
import { Types } from "mongoose";

export const listPropertiesQuerySchema = z.object({
  location: z.string().trim().min(1).optional(),
  minPrice: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine((v) => v === undefined || !Number.isNaN(v), {
      message: "minPrice must be a number"
    })
    .optional(),
  maxPrice: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine((v) => v === undefined || !Number.isNaN(v), {
      message: "maxPrice must be a number"
    })
    .optional(),
  bhk: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine((v) => v === undefined || !Number.isNaN(v), {
      message: "bhk must be a number"
    })
    .optional()
});

export const recommendationsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 6))
    .refine((n) => Number.isFinite(n) && n > 0 && n <= 20, {
      message: "limit must be between 1 and 20"
    })
    .optional()
});

export const createPropertySchema = z.object({
  location: z.string().trim().min(2).max(80),
  area: z.number().min(1),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  price: z.number().min(0),
  title: z.string().trim().min(3).max(120),
  address: z.string().trim().max(200).optional(),
  imageUrl: z.string().trim().url().optional(),
  description: z.string().trim().max(2000).optional(),
  history: z
    .array(
      z.object({
        date: z
          .string()
          .or(z.date())
          .transform((d) => new Date(d)),
        price: z.number().min(0)
      })
    )
    .optional()
});

export const updatePropertySchema = createPropertySchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, { message: "No fields provided" });

export const naturalSearchQuerySchema = z.object({
  query: z.string().trim().min(3).max(200)
});

type NaturalSearch = {
  location?: string;
  bedrooms?: number;
  maxPrice?: number;
};

function parsePriceFromText(text: string): number | undefined {
  const t = text.toLowerCase();
  // Examples:
  // "under 50 lakh", "below 1 crore", "max 2500000"
  const lakh = t.match(/(under|below|max)\s*([0-9]+(\.[0-9]+)?)\s*(lakh|lakhs)\b/);
  if (lakh) return Number(lakh[2]) * 100000;

  const crore = t.match(/(under|below|max)\s*([0-9]+(\.[0-9]+)?)\s*(crore|crores)\b/);
  if (crore) return Number(crore[2]) * 10000000;

  const rupees = t.match(/(under|below|max)\s*([0-9]+(\.[0-9]+)?)\b/);
  if (rupees) return Number(rupees[2]);

  return undefined;
}

function parseBedroomsFromText(text: string): number | undefined {
  const m = text.match(/([0-9]+)\s*bhk\b/i);
  if (!m) return undefined;
  return Number(m[1]);
}

function parseLocationFromText(text: string): string | undefined {
  // Try patterns: "in <location>" or "at <location>"
  const m = text.match(/\b(in|at)\s+([a-zA-Z0-9\s,-]{2,60})/i);
  if (!m) return undefined;
  const loc = m[2].trim();
  return loc.length ? loc : undefined;
}

export function parseNaturalSearchText(query: string): NaturalSearch {
  const bedrooms = parseBedroomsFromText(query);
  const maxPrice = parsePriceFromText(query);
  const location = parseLocationFromText(query);
  return { bedrooms, maxPrice, location };
}

export async function listProperties(params: {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bhk?: number;
}) {
  const filter: Record<string, unknown> = {};

  if (params.location) filter.location = new RegExp(params.location, "i");
  if (typeof params.minPrice === "number") filter.price = { ...(filter.price as any), $gte: params.minPrice };
  if (typeof params.maxPrice === "number") filter.price = { ...(filter.price as any), $lte: params.maxPrice };
  if (typeof params.bhk === "number") filter.bedrooms = { $gte: params.bhk, $lte: params.bhk };

  const props = await PropertyModel.find(filter)
    .sort({ price: 1 })
    .limit(200)
    .lean();

  return props;
}

export async function getPropertyById(id: string) {
  if (!Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid property id");
  const prop = await PropertyModel.findById(id).lean();
  if (!prop) throw new ApiError(404, "Property not found");
  return prop;
}

export async function createProperty(input: z.infer<typeof createPropertySchema>) {
  return PropertyModel.create(input);
}

export async function updateProperty(id: string, input: z.infer<typeof updatePropertySchema>) {
  if (!Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid property id");
  const updated = await PropertyModel.findByIdAndUpdate(id, input, { new: true });
  if (!updated) throw new ApiError(404, "Property not found");
  return updated;
}

export async function removeProperty(id: string) {
  if (!Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid property id");
  const deleted = await PropertyModel.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "Property not found");
  return { ok: true };
}

export async function searchNatural(query: string) {
  const parsed = parseNaturalSearchText(query);

  const filter: Record<string, unknown> = {};
  if (parsed.location) filter.location = new RegExp(parsed.location, "i");
  if (typeof parsed.maxPrice === "number") filter.price = { $lte: parsed.maxPrice };
  if (typeof parsed.bedrooms === "number") filter.bedrooms = parsed.bedrooms;

  return PropertyModel.find(filter).sort({ price: 1 }).limit(100).lean();
}

function similarityScore(target: any, other: any) {
  const locationMatch =
    String(target.location).toLowerCase() === String(other.location).toLowerCase() ? 1 : 0;

  const areaRel = Math.abs(target.area - other.area) / Math.max(target.area, other.area, 1);
  const bedroomsRel = Math.abs(target.bedrooms - other.bedrooms) / Math.max(target.bedrooms, other.bedrooms, 1);
  const bathroomsRel = Math.abs(target.bathrooms - other.bathrooms) / Math.max(target.bathrooms, other.bathrooms, 1);

  // Convert relative diffs into bounded similarity
  const areaSim = 1 / (1 + areaRel);
  const bedSim = 1 / (1 + bedroomsRel);
  const bathSim = 1 / (1 + bathroomsRel);

  return locationMatch * 2.5 + areaSim * 1.5 + bedSim * 1.2 + bathSim * 1.0;
}

export async function getRecommendationsForProperty(propertyId: string, limit = 6) {
  const target = await PropertyModel.findById(propertyId).lean();
  if (!target) throw new ApiError(404, "Property not found");

  const others = await PropertyModel.find({ _id: { $ne: target._id } })
    .select("location area bedrooms bathrooms price title imageUrl address history")
    .lean();

  const scored = others
    .map((p) => ({ p, score: similarityScore(target, p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p }) => p);

  return scored;
}

export async function getPropertyHistoryTrend(location: string, maxMonths = 12) {
  const props = await PropertyModel.find({ location: new RegExp(location, "i") }).lean();
  if (!props.length) return [];

  // Group all history entries by month
  const monthMap = new Map<string, { sum: number; count: number }>();

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

