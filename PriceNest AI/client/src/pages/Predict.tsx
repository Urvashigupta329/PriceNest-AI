import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { predictPrice, type Property, fetchProperties } from "../api/endpoints";

const schema = z.object({
  location: z.string().min(2).max(80),
  area: z.coerce.number().min(1),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0)
});

type FormValues = z.infer<typeof schema>;

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

export function Predict() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [predicted, setPredicted] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearby, setNearby] = useState<Property[]>([]);

  const disclaimer = useMemo(() => {
    return "Predictions are ML estimates trained on the sample dataset.";
  }, []);

  async function onSubmit(values: FormValues) {
    setError(null);
    setLoading(true);
    setPredicted(null);
    setNearby([]);
    try {
      const resp = await predictPrice(values);
      setPredicted(resp.predictedPrice);

      // Show "similar" listings by closeness to predicted price.
      const resp2 = await fetchProperties({
        location: values.location,
        bhk: values.bedrooms
      });
      const sorted = resp2.properties
        .slice()
        .sort((a, b) => Math.abs(a.price - resp.predictedPrice) - Math.abs(b.price - resp.predictedPrice))
        .slice(0, 4);
      setNearby(sorted);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        <div className="font-bold text-slate-900 text-2xl">Price Prediction</div>
        <div className="mt-2 text-sm text-slate-600">{disclaimer}</div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Location</span>
            <input
              {...register("location")}
              className="border border-slate-200 rounded-lg px-3 py-2"
              placeholder="e.g. Bengaluru"
            />
            {errors.location ? (
              <span className="text-xs text-red-600">{errors.location.message}</span>
            ) : null}
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-700">Area (sqft)</span>
              <input
                {...register("area")}
                className="border border-slate-200 rounded-lg px-3 py-2"
                inputMode="numeric"
              />
              {errors.area ? (
                <span className="text-xs text-red-600">{errors.area.message}</span>
              ) : null}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-700">Bedrooms</span>
              <input
                {...register("bedrooms")}
                className="border border-slate-200 rounded-lg px-3 py-2"
                inputMode="numeric"
              />
              {errors.bedrooms ? (
                <span className="text-xs text-red-600">{errors.bedrooms.message}</span>
              ) : null}
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Bathrooms</span>
            <input
              {...register("bathrooms")}
              className="border border-slate-200 rounded-lg px-3 py-2"
              inputMode="numeric"
            />
            {errors.bathrooms ? (
              <span className="text-xs text-red-600">{errors.bathrooms.message}</span>
            ) : null}
          </label>

          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Predicting..." : "Predict Price"}
          </button>
        </form>

        {predicted !== null ? (
          <div className="mt-5 bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="text-sm text-slate-600">Predicted price</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{formatINR(predicted)}</div>
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <div className="font-bold text-slate-900 text-xl">Nearest Listings</div>
          <div className="mt-2 text-sm text-slate-600">
            Based on closeness to predicted price within same location/BHK.
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {nearby.map((p) => (
              <div key={p._id} className="border border-slate-200 rounded-2xl overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.title} className="h-32 w-full object-cover" />
                ) : (
                  <div className="h-32 bg-slate-100" />
                )}
                <div className="p-3">
                  <div className="font-semibold text-slate-900 line-clamp-1">{p.title}</div>
                  <div className="text-sm text-slate-600">{formatINR(p.price)}</div>
                  <div className="text-xs text-slate-500 mt-1">{p.area} sqft</div>
                </div>
              </div>
            ))}
            {!nearby.length && predicted !== null ? (
              <div className="text-sm text-slate-600">No listings found to compare.</div>
            ) : null}
            {!nearby.length && predicted === null ? (
              <div className="text-sm text-slate-600">Run a prediction to see comparisons.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

