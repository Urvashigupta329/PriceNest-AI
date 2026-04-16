import React, { useEffect, useMemo, useState } from "react";
import { fetchTrend, listFavorites, type Property } from "../api/endpoints";
import { TrendChart } from "../charts/TrendChart";
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

export function Dashboard() {
  const { auth } = useAuth();
  const { showToast } = useToast();

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
        const message = e?.response?.data?.error ?? "Failed to load trend";
        setTrendError(message);
        showToast(message, "error");
      } finally {
        setLoadingTrend(false);
      }
    })();
  }, [location, months, showToast]);

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
    <div className="space-y-8">
      <div className="glass-card rounded-[2rem] border-slate-700 p-8 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">Investor dashboard</div>
            <h1 className="mt-3 text-3xl font-semibold text-white">Market trends and saved insights.</h1>
          </div>
          <div className="rounded-3xl bg-slate-900/80 px-5 py-3 text-sm text-slate-300">
            Welcome back, {auth.user?.name ?? "Investor"}
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-6">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Trend window</div>
            <div className="mt-3 text-3xl font-semibold text-white">{months} months</div>
            <p className="mt-2 text-slate-500">Forecast range for location insights.</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-6">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Active saved homes</div>
            <div className="mt-3 text-3xl font-semibold text-white">{favorites.length}</div>
            <p className="mt-2 text-slate-500">Your favorite property portfolio.</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-6">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Avg listing price</div>
            <div className="mt-3 text-3xl font-semibold text-white">{avg !== null ? formatINR(avg) : "—"}</div>
            <p className="mt-2 text-slate-500">Average value from trend analytics.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="glass-card rounded-[2rem] border-slate-700 p-8 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Price trend analytics</h2>
              <p className="mt-2 text-slate-400">Analyze the historical curve for location performance.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Location</span>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-white outline-none"
                >
                  {locations.map((l) => (
                    <option key={l} value={l} className="bg-slate-950 text-white">
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Months</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-white outline-none"
                />
              </label>
            </div>
          </div>

          {trendError ? (
            <div className="mt-6 rounded-3xl bg-rose-950/80 border border-rose-700/40 p-4 text-sm text-rose-300">
              {trendError}
            </div>
          ) : null}

          <div className="mt-6">
            {loadingTrend ? (
              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-20 text-center text-slate-500">Loading chart...</div>
            ) : (
              <TrendChart data={trend} />
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] border-slate-700 p-8 shadow-soft">
          <div className="text-sm uppercase tracking-[0.24em] text-cyan-300">Favorites</div>
          <h2 className="mt-3 text-2xl font-semibold text-white">Saved properties</h2>
          <div className="mt-6 space-y-4">
            {favorites.length ? (
              favorites.map((property) => (
                <div key={property._id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white line-clamp-1">{property.title}</div>
                      <div className="text-sm text-slate-400">{property.location}</div>
                    </div>
                    <div className="text-right text-sm text-slate-300">{formatINR(property.price)}</div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
                    <span>{property.bedrooms}BHK</span>
                    <span>•</span>
                    <span>{property.area} sqft</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 text-center text-slate-500">
                No favorites yet. Add a property from the listings page to keep track of strong opportunities.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

