import React, { useEffect, useMemo, useState } from "react";
import { fetchProperties, type Property } from "../api/endpoints";

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

function metricDiff(value: number, base: number) {
  const diff = value - base;
  const prefix = diff > 0 ? "+" : "";
  return `${prefix}${diff}`;
}

export function Compare() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [selectedA, setSelectedA] = useState<string>("");
  const [selectedB, setSelectedB] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchProperties({});
        setProperties(resp.properties);
      } catch (e: any) {
        setError(e?.response?.data?.error ?? "Unable to load properties for comparison.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return properties;
    return properties.filter((property) =>
      [property.title, property.location, property.address].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }, [properties, search]);

  const propertyA = useMemo(() => properties.find((p) => p._id === selectedA), [properties, selectedA]);
  const propertyB = useMemo(() => properties.find((p) => p._id === selectedB), [properties, selectedB]);

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-[2rem] border-slate-700 p-8 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Compare properties side by side</h1>
            <p className="mt-2 text-slate-400">Select two homes and uncover value gaps, layout differences, and price insights instantly.</p>
          </div>
          <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300">Smart investor tool</div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-6">
            <div className="text-sm uppercase tracking-[0.24em] text-cyan-300">Search listings</div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-400"
              placeholder="Filter by title, location, or address"
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Property A</span>
                <select
                  value={selectedA}
                  onChange={(e) => setSelectedA(e.target.value)}
                  className="rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white outline-none"
                >
                  <option value="">Choose a property</option>
                  {filtered.map((property) => (
                    <option key={property._id} value={property._id}>
                      {property.title} • {property.location}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                <span>Property B</span>
                <select
                  value={selectedB}
                  onChange={(e) => setSelectedB(e.target.value)}
                  className="rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white outline-none"
                >
                  <option value="">Choose a property</option>
                  {filtered.map((property) => (
                    <option key={property._id} value={property._id}>
                      {property.title} • {property.location}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-6">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Comparison summary</div>
            <div className="mt-4 text-lg font-semibold text-white">Select two properties to compare their metrics.</div>
            <div className="mt-5 grid gap-3">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
                {loading ? "Loading properties..." : error ? error : "Search and select two homes to reveal a side-by-side comparison."}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-400">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="font-semibold text-white">Total options</div>
                  <div className="mt-2 text-3xl">{properties.length}</div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="font-semibold text-white">Filtered</div>
                  <div className="mt-2 text-3xl">{filtered.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedA && selectedB ? (
        selectedA === selectedB ? (
          <div className="rounded-[2rem] border border-rose-700/40 bg-rose-950/80 p-8 text-center text-rose-200">
            Select two different properties to compare their details.
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            {[propertyA, propertyB].map((property, index) => (
              <div key={index} className="glass-card rounded-[2rem] border-slate-700 p-6 shadow-soft">
                {property ? (
                  <>
                    <div className="text-sm uppercase tracking-[0.24em] text-cyan-300">Property {index === 0 ? "A" : "B"}</div>
                    <h2 className="mt-3 text-2xl font-semibold text-white">{property.title}</h2>
                    <p className="mt-2 text-slate-400">{property.location}</p>
                    <div className="mt-6 space-y-3 text-sm text-slate-300">
                      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                        <div className="font-semibold text-slate-300">Price</div>
                        <div className="mt-2 text-2xl text-white">{formatINR(property.price)}</div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Area</div>
                          <div className="mt-2 text-xl text-white">{property.area} sqft</div>
                        </div>
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Bedrooms</div>
                          <div className="mt-2 text-xl text-white">{property.bedrooms}</div>
                        </div>
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Bathrooms</div>
                          <div className="mt-2 text-xl text-white">{property.bathrooms}</div>
                        </div>
                      </div>
                      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                        <div className="text-sm text-slate-400">Description</div>
                        <p className="mt-2 text-slate-300">{property.description ?? "No additional description available."}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center text-slate-400">Property not found.</div>
                )}
              </div>
            ))}

            <div className="glass-card rounded-[2rem] border-slate-700 p-8 shadow-soft">
              <div className="text-sm uppercase tracking-[0.24em] text-cyan-300">Head-to-head comparison</div>
              <div className="mt-5 grid gap-4">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Price gap</span>
                    <span className="font-medium text-white">{propertyA && propertyB ? formatINR(Math.abs(propertyA.price - propertyB.price)) : "—"}</span>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Area difference</span>
                    <span className="font-medium text-white">{propertyA && propertyB ? metricDiff(propertyA.area, propertyB.area) : "—"} sqft</span>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Bedrooms difference</span>
                    <span className="font-medium text-white">{propertyA && propertyB ? metricDiff(propertyA.bedrooms, propertyB.bedrooms) : "—"}</span>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Bathrooms difference</span>
                    <span className="font-medium text-white">{propertyA && propertyB ? metricDiff(propertyA.bathrooms, propertyB.bathrooms) : "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
