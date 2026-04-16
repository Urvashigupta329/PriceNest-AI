import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { predictPrice, type Property, fetchProperties } from "../api/endpoints";
import { useToast } from "../components/ToastProvider";

const schema = z.object({
  location: z.string().min(2).max(80),
  area: z.coerce.number().min(1),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0)
});

type FormValues = z.infer<typeof schema>;

type PredictionResult = { predictedPrice: number; confidenceScore?: number };

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

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [nearby, setNearby] = useState<Property[]>([]);
  const { showToast } = useToast();

  const disclaimer = useMemo(
    () => "Predictions are ML estimates trained on the sample dataset.",
    []
  );

  async function onSubmit(values: FormValues) {
    console.log("[PREDICT] Form submitted with values:", values);
    setResult(null);
    setNearby([]);
    setLoading(true);

    try {
      console.log("[PREDICT] Sending request to /api/predict");
      const resp = await predictPrice(values);
      console.log("[PREDICT] Response received:", resp);
      setResult(resp);
      showToast("Prediction completed successfully.", "success");

      console.log("[PREDICT] Fetching similar properties for location:", values.location);
      const resp2 = await fetchProperties({ location: values.location, bhk: values.bedrooms });
      console.log("[PREDICT] Similar properties fetched:", resp2.properties.length, "results");
      const sorted = resp2.properties
        .slice()
        .sort((a, b) => Math.abs(a.price - resp.predictedPrice) - Math.abs(b.price - resp.predictedPrice))
        .slice(0, 4);
      console.log("[PREDICT] Sorted and showing", sorted.length, "similar listings");
      setNearby(sorted);
    } catch (e: any) {
      console.error("[PREDICT] Error occurred:", e);
      console.error("[PREDICT] Error response:", e?.response?.data);
      console.error("[PREDICT] Status:", e?.response?.status);
      console.error("[PREDICT] Message:", e?.message);
      const message = e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? "Prediction failed";
      console.log("[PREDICT] Showing error to user:", message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="glass-card rounded-[2rem] border-slate-700 p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">Smart price predictions</h1>
            <p className="mt-2 text-slate-400">Enter property details and get rapid ML-backed pricing insight.</p>
          </div>
          <div className="rounded-3xl bg-slate-900/80 px-4 py-2 text-sm text-cyan-300">Confidence-first AI</div>
        </div>

        <div className="mt-8 grid gap-5">
          <div className="grid gap-4">
            <label className="text-sm text-slate-300">Location</label>
            <input
              {...register("location")}
              className="rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              placeholder="e.g. Mumbai"
            />
            {errors.location ? <span className="text-sm text-rose-400">{errors.location.message}</span> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm text-slate-300">Area (sqft)</label>
              <input
                {...register("area")}
                className="rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                inputMode="numeric"
                placeholder="e.g. 1200"
              />
              {errors.area ? <span className="text-sm text-rose-400">{errors.area.message}</span> : null}
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-300">Bedrooms</label>
              <input
                {...register("bedrooms")}
                className="rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                inputMode="numeric"
                placeholder="e.g. 3"
              />
              {errors.bedrooms ? <span className="text-sm text-rose-400">{errors.bedrooms.message}</span> : null}
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-slate-300">Bathrooms</label>
            <input
              {...register("bathrooms")}
              className="rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              inputMode="numeric"
              placeholder="e.g. 2"
            />
            {errors.bathrooms ? <span className="text-sm text-rose-400">{errors.bathrooms.message}</span> : null}
          </div>

          <p className="text-sm text-slate-500">{disclaimer}</p>

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Predicting..." : "Run Prediction"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="glass-card rounded-[2rem] border-slate-700 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">Result</div>
              <div className="mt-2 text-2xl font-semibold text-white">Your AI estimate</div>
            </div>
            <div className="rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-200">Live ML insight</div>
          </div>

          <div className="mt-8 rounded-[1.75rem] bg-slate-950/90 p-6 text-center">
            <div className="text-sm text-slate-500">Predicted value</div>
            <div className="mt-3 text-4xl font-semibold text-white">
              {result ? formatINR(result.predictedPrice) : "—"}
            </div>
            <div className="mt-2 text-sm text-slate-400">Updated instantly after every successful prediction.</div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>ML confidence</span>
                <span className="font-semibold text-white">{result?.confidenceScore != null ? `${Math.round(result.confidenceScore * 100)}%` : "N/A"}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                  style={{ width: result?.confidenceScore ? `${Math.min(100, Math.max(0, result.confidenceScore * 100))}%` : "4%" }}
                />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-400">
              {result ? (
                <>
                  Estimation based on location familiarity and feature patterns. Higher confidence means the ML model recognizes the area and property mix.
                </>
              ) : (
                "Fill the form to generate a premium prediction preview."
              )}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] border-slate-700 p-6">
          <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">Compare</div>
          <div className="mt-3 text-lg font-semibold text-white">Similar listings</div>
          <div className="mt-4 grid gap-4">
            {nearby.length > 0 ? (
              nearby.map((property) => (
                <div key={property._id} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white line-clamp-1">{property.title}</div>
                      <div className="text-sm text-slate-500">{property.location}</div>
                    </div>
                    <div className="text-right text-sm text-slate-300">{property.bedrooms}BHK</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                    <span>{property.area} sqft</span>
                    <span>{formatINR(property.price)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 text-center text-slate-500">
                Predictions unlock nearby comparable listings.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

