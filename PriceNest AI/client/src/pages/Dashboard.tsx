import React, { useEffect, useMemo, useState } from "react";
import { fetchTrend, listFavorites, type Property } from "../api/endpoints";
import { TrendChart } from "../charts/TrendChart";
import { useAuth } from "../auth/AuthContext";

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

export function Dashboard() {
  const { auth } = useAuth();

  const locations = useMemo(() => ["Bengaluru", "Mumbai", "Delhi", "Hyderabad"], []);
  const [location, setLocation] = useState("Bengaluru");
  const [months, setMonths] = useState(12);

  const [trend, setTrend] = useState<{ date: string; price: number }[]>([]);
  const [loadingTrend, setLoadingTrend] = useState(false);
  const [trendError, setTrendError] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<Property[]>([]);

  useEffect(() => {
    (async () => {
      setLoadingTrend(true);
      setTrendError(null);
      try {
        const resp = await fetchTrend(location, months);
        setTrend(resp.trend);
      } catch (e: any) {
        setTrendError(e?.response?.data?.error ?? "Failed to load trend");
      } finally {
        setLoadingTrend(false);
      }
    })();
  }, [location, months]);

  useEffect(() => {
    (async () => {
      if (!auth.token) return;
      try {
        const resp = await listFavorites();
        setFavorites(resp.properties);
      } catch {
        setFavorites([]);
      }
    })();
  }, [auth.token]);

  const avg = useMemo(() => {
    if (!trend.length) return null;
    const sum = trend.reduce((a, p) => a + p.price, 0);
    return sum / trend.length;
  }, [trend]);

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6">
          <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
            <div>
              <div className="font-bold text-slate-900 text-xl">Price Trend Analytics</div>
              <div className="text-sm text-slate-600 mt-1">
                Basic line chart using sample property history.
              </div>
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-700">Location</span>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2"
              >
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-700">Months</span>
              <input
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                type="number"
                min={1}
                max={60}
                className="border border-slate-200 rounded-lg px-3 py-2"
              />
            </label>
          </div>

          {trendError ? (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-800 rounded-xl p-3">
              {trendError}
            </div>
          ) : null}

          <div className="mt-4">
            {loadingTrend ? <div className="text-slate-600">Loading trend...</div> : null}
            {!loadingTrend ? <TrendChart data={trend} /> : null}
          </div>

          {avg !== null ? (
            <div className="mt-4 text-sm text-slate-700">
              Average historical price: <span className="font-semibold">{formatINR(avg)}</span>
            </div>
          ) : null}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <div className="font-bold text-slate-900 text-xl">Favorites</div>
          <div className="text-sm text-slate-600 mt-1">Saved properties from your account.</div>

          <div className="mt-4 space-y-3">
            {favorites.length ? (
              favorites.map((p) => (
                <div
                  key={p._id}
                  className="border border-slate-200 rounded-2xl p-3 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-slate-900 line-clamp-1">{p.title}</div>
                    <div className="text-xs text-slate-600">{p.location}</div>
                    <div className="text-xs text-slate-500 mt-1">{p.bedrooms}BHK • {p.area} sqft</div>
                  </div>
                  <div className="font-bold text-slate-900">{formatINR(p.price)}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-600">
                No favorites yet. Open a property and click “Add to Favorites”.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

