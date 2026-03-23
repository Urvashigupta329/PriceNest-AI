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
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-700">Location</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2"
            placeholder={`e.g. ${locationsHint.join(", ")}`}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-700">Min Price (INR)</span>
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            inputMode="numeric"
            className="border border-slate-200 rounded-lg px-3 py-2"
            placeholder="e.g. 4000000"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-700">Max Price (INR)</span>
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            inputMode="numeric"
            className="border border-slate-200 rounded-lg px-3 py-2"
            placeholder="e.g. 8000000"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-700">BHK</span>
          <input
            value={bhk}
            onChange={(e) => setBhk(e.target.value)}
            inputMode="numeric"
            className="border border-slate-200 rounded-lg px-3 py-2"
            placeholder="e.g. 2"
          />
        </label>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={submit}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
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
          className="px-4 py-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

