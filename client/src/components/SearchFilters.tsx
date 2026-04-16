import React, { useMemo, useState } from "react";

export type PropertyFilters = {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bhk?: number;
};

export function SearchFilters({
  initial,
  onSubmit
}: {
  initial?: PropertyFilters;
  onSubmit: (filters: PropertyFilters) => void;
}) {
  const [location, setLocation] = useState(initial?.location ?? "");
  const [minPrice, setMinPrice] = useState(initial?.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(initial?.maxPrice?.toString() ?? "");
  const [bhk, setBhk] = useState(initial?.bhk?.toString() ?? "");

  const locationsHint = useMemo(
    () => ["Bengaluru", "Mumbai", "Delhi", "Hyderabad"],
    []
  );

  function submit() {
    const filters: PropertyFilters = {};
    const loc = location.trim();
    if (loc) filters.location = loc;
    if (minPrice) filters.minPrice = Number(minPrice);
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    if (bhk) filters.bhk = Number(bhk);
    onSubmit(filters);
  }

  return (
    <div className="rounded-[2rem] border border-slate-700 bg-slate-950/80 p-6 shadow-soft">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-2 text-sm text-slate-300">
          <span>Location</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-400"
            placeholder={`e.g. ${locationsHint.join(", ")}`}
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-300">
          <span>Min Price (INR)</span>
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            inputMode="numeric"
            className="rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-400"
            placeholder="e.g. 4000000"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-300">
          <span>Max Price (INR)</span>
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            inputMode="numeric"
            className="rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-400"
            placeholder="e.g. 8000000"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-300">
          <span>BHK</span>
          <input
            value={bhk}
            onChange={(e) => setBhk(e.target.value)}
            inputMode="numeric"
            className="rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-400"
            placeholder="e.g. 2"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={submit}
          className="rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Apply Filters
        </button>
        <button
          onClick={() => {
            setLocation("");
            setMinPrice("");
            setMaxPrice("");
            setBhk("");
            onSubmit({});
          }}
          className="rounded-3xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm text-slate-300 transition hover:border-cyan-400"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

