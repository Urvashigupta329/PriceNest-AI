import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

export function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function quickSearch() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // This is a lightweight "natural search preview" on the home page.
      const resp = await api.get("/api/properties/search-natural", {
        params: { query }
      });
      // Navigate to listing and pass results via location state.
      navigate("/properties", { state: { initialResults: resp.data.properties } });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="p-8 sm:p-12 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Predict real-estate prices with AI.
            </h1>
            <p className="mt-4 text-slate-200">
              Built for beginner-friendly learning, but structured like a real production system: React +
              Express + MongoDB + Flask ML.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/properties")}
                className="px-5 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100"
              >
                Browse Properties
              </button>
              <button
                onClick={() => navigate("/predict")}
                className="px-5 py-3 rounded-xl bg-transparent border border-white/30 text-white font-semibold hover:bg-white/10"
              >
                Price Prediction
              </button>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
            <div className="text-sm text-slate-200">Try natural search</div>
            <div className="mt-2 flex gap-2">
              <input
                className="flex-1 px-3 py-2 rounded-xl bg-white text-slate-900 outline-none"
                placeholder="e.g. 2BHK under 50 lakh in Bengaluru"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                onClick={quickSearch}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold disabled:opacity-60"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-200">
              Backend parses the query and returns matching listings.
            </p>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <FeatureCard
          title="JWT Authentication"
          description="Register/login with hashed passwords and role-based admin endpoints for CRUD."
        />
        <FeatureCard
          title="ML Regression Model"
          description="Flask + scikit-learn trains on the included sample dataset and exposes `/predict`."
        />
        <FeatureCard
          title="Recommendations & Trends"
          description="Similar property recommendations plus a basic price trend chart for dashboards."
        />
      </section>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
      <div className="font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm text-slate-600">{description}</div>
    </div>
  );
}

