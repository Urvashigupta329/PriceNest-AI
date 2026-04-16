import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { SearchFilters, type PropertyFilters } from "../components/SearchFilters";
import { PropertyCard } from "../components/PropertyCard";
import { fetchProperties, searchNatural, type Property } from "../api/endpoints";
import { useToast } from "../components/ToastProvider";

export function Properties() {
  const loc = useLocation();
  const initialResults = (loc.state as any)?.initialResults as Property[] | undefined;
  const { showToast } = useToast();

  const [properties, setProperties] = useState<Property[]>(initialResults ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<PropertyFilters>({});
  const [naturalQuery, setNaturalQuery] = useState("");
  const [naturalLoading, setNaturalLoading] = useState(false);

  const hasInitial = useMemo(() => initialResults !== undefined, [initialResults]);

  useEffect(() => {
    if (hasInitial) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchProperties({});
        setProperties(resp.properties);
      } catch (e: any) {
        const message = e?.response?.data?.error ?? "Failed to load properties";
        setError(message);
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [hasInitial, showToast]);

  async function applyFilters(next: PropertyFilters) {
    setFilters(next);
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchProperties(next);
      setProperties(resp.properties);
      showToast("Filters applied", "success");
    } catch (e: any) {
      const message = e?.response?.data?.error ?? "Failed to apply filters";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function runNaturalSearch() {
    if (!naturalQuery.trim()) return;
    setNaturalLoading(true);
    setError(null);
    try {
      const resp = await searchNatural(naturalQuery);
      setProperties(resp.properties);
      showToast("Natural search complete", "success");
    } catch (e: any) {
      const message = e?.response?.data?.error ?? "Natural search failed";
      setError(message);
      showToast(message, "error");
    } finally {
      setNaturalLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-[2rem] border-slate-700 p-8 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Discover premium real estate opportunities.</h1>
            <p className="mt-2 text-slate-400">Filter by location, price, and BHK. Or use natural language search for fast results.</p>
          </div>
          <div className="rounded-3xl bg-slate-900/80 px-5 py-3 text-sm text-slate-300">Live property market browser</div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <SearchFilters initial={filters} onSubmit={applyFilters} />
          <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-6">
            <div className="text-sm uppercase tracking-[0.22em] text-cyan-300">Natural search</div>
            <p className="mt-3 text-slate-400">Try a quick query for a smarter property browse flow.</p>
            <div className="mt-4 flex gap-3">
              <input
                value={naturalQuery}
                onChange={(e) => setNaturalQuery(e.target.value)}
                className="flex-1 rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                placeholder="2BHK under 50 lakh in Bengaluru"
              />
              <button
                onClick={runNaturalSearch}
                disabled={naturalLoading}
                className="rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
              >
                {naturalLoading ? "Running..." : "Search"}
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500">This route uses the backend natural search endpoint to surface results quickly.</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-[1.75rem] border border-rose-700/50 bg-rose-950/70 p-5 text-sm text-rose-200">{error}</div>
      ) : null}

      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Listings</p>
            <h2 className="text-2xl font-semibold text-white">{loading ? "Fetching listings..." : `${properties.length} results found`}</h2>
          </div>
          <div className="rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
            {hasInitial ? "Refined search results" : "Complete property catalog"}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-64 rounded-[2rem] bg-slate-900/80" />
            ))}
          </div>
        ) : properties.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-slate-700 bg-slate-950/80 p-8 text-center text-slate-400">
            No properties match the current filters. Try clearing filters or adjusting your search.
          </div>
        )}
      </div>
    </div>
  );
}

