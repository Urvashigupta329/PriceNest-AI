import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { SearchFilters, type PropertyFilters } from "../components/SearchFilters";
import { PropertyCard } from "../components/PropertyCard";
import { api } from "../api/axios";
import { fetchProperties, searchNatural, type Property } from "../api/endpoints";

export function Properties() {
  const loc = useLocation();
  const initialResults = (loc.state as any)?.initialResults as Property[] | undefined;

  const [properties, setProperties] = useState<Property[]>(initialResults ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<PropertyFilters>({});

  const [naturalQuery, setNaturalQuery] = useState("");
  const [naturalLoading, setNaturalLoading] = useState(false);

  // If Home navigates here with `state.initialResults`, we should render exactly that (even if empty).
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
        setError(e?.response?.data?.error ?? "Failed to load properties");
      } finally {
        setLoading(false);
      }
    })();
  }, [hasInitial]);

  async function applyFilters(next: PropertyFilters) {
    setFilters(next);
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchProperties(next);
      setProperties(resp.properties);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to apply filters");
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
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Natural search failed");
    } finally {
      setNaturalLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
        <div className="w-full lg:max-w-xl">
          <SearchFilters initial={filters} onSubmit={applyFilters} />
        </div>

        <div className="w-full lg:flex-1 bg-white border border-slate-200 rounded-xl p-4">
          <div className="font-semibold text-slate-900">Natural Search (Optional)</div>
          <div className="mt-2 text-sm text-slate-600">
            Example: <span className="font-mono">2BHK under 50 lakh in Bengaluru</span>
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2"
              placeholder="Type your query"
            />
            <button
              onClick={runNaturalSearch}
              disabled={naturalLoading}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-60"
            >
              {naturalLoading ? "Searching..." : "Search"}
            </button>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Note: this uses a simple regex parser for beginners; production can use NLP models.
          </div>
        </div>
      </div>

      <div>
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-slate-600">
            {loading ? "Loading..." : `${properties.length} properties`}
          </div>
        </div>

        {loading ? (
          <div className="text-slate-600">Fetching listings...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

