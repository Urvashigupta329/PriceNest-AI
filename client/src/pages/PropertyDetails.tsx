import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { addFavorite, fetchPropertyById, listFavorites, predictPrice, removeFavorite, type Property } from "../api/endpoints";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/ToastProvider";

function formatINR(n: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(n);
  } catch {
    return `₹${Math.round(n).toLocaleString("en-IN")}`;
  }
}

export function PropertyDetails() {
  const { id } = useParams();
  const propertyId = id ?? "";
  const { auth } = useAuth();
  const { showToast } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [recommendations, setRecommendations] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const isFavorite = property ? favoriteIds.has(property._id) : false;

  const [predictForm, setPredictForm] = useState({
    location: "",
    area: 0,
    bedrooms: 0,
    bathrooms: 0
  });
  const [predictLoading, setPredictLoading] = useState(false);
  const [result, setResult] = useState<{ predictedPrice: number; confidenceScore?: number } | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchPropertyById(propertyId);
        setProperty(resp.property);
        setRecommendations(resp.recommendations);
        setPredictForm({
          location: resp.property.location,
          area: resp.property.area,
          bedrooms: resp.property.bedrooms,
          bathrooms: resp.property.bathrooms
        });
      } catch (e: any) {
        setError(e?.response?.data?.error ?? "Failed to load property");
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  useEffect(() => {
    if (!auth.token) return;
    (async () => {
      try {
        const resp = await listFavorites();
        setFavoriteIds(new Set(resp.properties.map((p) => p._id)));
      } catch {
        // Ignore favorites errors to keep UI usable.
      }
    })();
  }, [auth.token]);

  async function toggleFavorite() {
    if (!auth.token || !property) return;
    try {
      if (isFavorite) {
        await removeFavorite(property._id);
        setFavoriteIds((s) => {
          const n = new Set(s);
          n.delete(property._id);
          return n;
        });
      } else {
        await addFavorite(property._id);
        setFavoriteIds((s) => new Set([...Array.from(s), property._id]));
      }
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to update favorites");
    }
  }

  const recommendationsTitle = useMemo(() => {
    return recommendations.length ? `Similar in ${property?.location ?? ""}` : "Similar properties";
  }, [recommendations.length, property?.location]);

  return (
    <div className="space-y-6">
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-slate-600">Loading property...</div>
      ) : property ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            {property.imageUrl ? (
              <img
                src={property.imageUrl}
                alt={property.title}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-slate-100" />
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-2xl font-bold text-slate-900">{property.title}</div>
                  <div className="mt-1 text-slate-600">{property.location}</div>
                  {property.address ? (
                    <div className="mt-1 text-sm text-slate-600">{property.address}</div>
                  ) : null}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">{formatINR(property.price)}</div>
                  <div className="text-sm text-slate-500">{property.area} sqft</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-slate-100 px-3 py-1 rounded-full text-sm">
                  {property.bedrooms} BHK
                </span>
                <span className="bg-slate-100 px-3 py-1 rounded-full text-sm">
                  {property.bathrooms} Baths
                </span>
              </div>

              {property.description ? (
                <p className="mt-4 text-slate-700 leading-relaxed">{property.description}</p>
              ) : null}

              <div className="mt-5">
                <button
                  onClick={toggleFavorite}
                  disabled={!auth.token}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-60"
                >
                  {auth.token ? (isFavorite ? "Remove Favorite" : "Add to Favorites") : "Login to save favorites"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-5">
              <div className="font-semibold text-slate-900">Estimate with ML</div>
              <div className="mt-1 text-sm text-slate-600">
                Uses Flask regression model. Adjust values to see output.
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-slate-700">Location</span>
                  <input
                    value={predictForm.location}
                    onChange={(e) => setPredictForm((s) => ({ ...s, location: e.target.value }))}
                    className="border border-slate-200 rounded-lg px-3 py-2"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-slate-700">Area (sqft)</span>
                  <input
                    value={predictForm.area ? String(predictForm.area) : ""}
                    onChange={(e) => setPredictForm((s) => ({ ...s, area: Number(e.target.value) }))}
                    className="border border-slate-200 rounded-lg px-3 py-2"
                    inputMode="numeric"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-slate-700">Bedrooms</span>
                  <input
                    value={predictForm.bedrooms ? String(predictForm.bedrooms) : ""}
                    onChange={(e) => setPredictForm((s) => ({ ...s, bedrooms: Number(e.target.value) }))}
                    className="border border-slate-200 rounded-lg px-3 py-2"
                    inputMode="numeric"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-slate-700">Bathrooms</span>
                  <input
                    value={predictForm.bathrooms ? String(predictForm.bathrooms) : ""}
                    onChange={(e) => setPredictForm((s) => ({ ...s, bathrooms: Number(e.target.value) }))}
                    className="border border-slate-200 rounded-lg px-3 py-2"
                    inputMode="numeric"
                  />
                </label>
              </div>

              <div className="mt-4 space-y-4">
                <button
                  onClick={async () => {
                    setPredictLoading(true);
                    setResult(null);
                    try {
                      const resp = await predictPrice(predictForm);
                      setResult(resp);
                      showToast("Prediction completed.", "success");
                    } catch (e: any) {
                      const message = e?.response?.data?.error ?? "Prediction failed";
                      setError(message);
                      showToast(message, "error");
                    } finally {
                      setPredictLoading(false);
                    }
                  }}
                  disabled={predictLoading}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {predictLoading ? "Predicting..." : "Predict Price"}
                </button>

                {result ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="text-sm text-slate-600">Predicted value</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{formatINR(result.predictedPrice)}</div>
                    <div className="mt-3 flex items-center justify-between gap-2 text-sm text-slate-600">
                      <span>AI confidence</span>
                      <span className="font-semibold text-slate-900">{result.confidenceScore != null ? `${Math.round(result.confidenceScore * 100)}%` : "N/A"}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                        style={{ width: result.confidenceScore ? `${Math.min(100, Math.max(0, result.confidenceScore * 100))}%` : "0%" }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-3">
              <div className="font-semibold text-slate-900">{recommendationsTitle}</div>
              <div className="grid sm:grid-cols-2 gap-4">
                {recommendations.map((r) => (
                  <div key={r._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="p-4">
                      <div className="font-semibold text-slate-900 line-clamp-1">
                        {r.title}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">{r.location}</div>
                      <div className="mt-3 font-bold text-slate-900">{formatINR(r.price)}</div>
                      <div className="text-xs text-slate-500 mt-1">{r.area} sqft</div>
                    </div>
                  </div>
                ))}
              </div>
              {!recommendations.length ? (
                <div className="text-sm text-slate-600">No recommendations yet.</div>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-slate-600">Property not found.</div>
      )}
    </div>
  );
}

