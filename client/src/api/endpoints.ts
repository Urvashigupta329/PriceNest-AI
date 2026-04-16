import { api } from "./axios";

export type Property = {
  _id: string;
  location: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  price: number;
  title: string;
  imageUrl?: string;
  address?: string;
  description?: string;
  history?: { date: string; price: number }[];
  createdAt?: string;
};

export async function fetchProperties(params: {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bhk?: number;
}) {
  const resp = await api.get("/api/properties", { params });
  return resp.data as { properties: Property[] };
}

export async function fetchPropertyById(id: string) {
  const resp = await api.get(`/api/properties/${id}`);
  return resp.data as { property: Property; recommendations: Property[] };
}

export async function fetchRecommendations(id: string, limit = 6) {
  const resp = await api.get(`/api/properties/${id}/recommendations`, { params: { limit } });
  return resp.data as { recommendations: Property[] };
}

export async function searchNatural(query: string) {
  const resp = await api.get("/api/properties/search-natural", { params: { query } });
  return resp.data as { properties: Property[] };
}

export async function predictPrice(input: {
  location: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
}) {
  const resp = await api.post("/api/predict", input);
  return resp.data as { predictedPrice: number; confidenceScore?: number };
}

export async function fetchTrend(location: string, months = 12) {
  const resp = await api.get("/api/analytics/trend", { params: { location, months } });
  return resp.data as { trend: { date: string; price: number }[] };
}

export async function listFavorites() {
  const resp = await api.get("/api/favorites");
  return resp.data as { properties: Property[] };
}

export async function addFavorite(propertyId: string) {
  const resp = await api.post(`/api/favorites/${propertyId}`);
  return resp.data as { favoriteId: string };
}

export async function removeFavorite(propertyId: string) {
  await api.delete(`/api/favorites/${propertyId}`);
}

