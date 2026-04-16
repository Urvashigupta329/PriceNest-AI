import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { useToast } from "../components/ToastProvider";

const stats = [
  { label: "AI-trained model", value: "Regression engine" },
  { label: "Sample listings", value: "150+ homes" },
  { label: "Startup-grade UX", value: "Mobile first" }
];

const testimonials = [
  {
    quote: "PriceNestAI feels polished, modern and smart—the AI result card is a standout.",
    name: "Ananya R.",
    role: "Product Lead"
  },
  {
    quote: "A great portfolio project with a strong real-world architecture and clean design.",
    name: "Rahul K.",
    role: "Investor"
  }
];

export function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function quickSearch() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const resp = await api.get("/api/properties/search-natural", { params: { query } });
      navigate("/properties", { state: { initialResults: resp.data.properties } });
    } catch (error: any) {
      showToast("Natural search failed. Try a simpler query.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/90 p-8 shadow-card sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.24),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(52,211,153,0.18),_transparent_30%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
              Launch-ready product demo • premium real-estate AI
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Predict property value with precision and investor-ready polish.
            </h1>
            <p className="max-w-2xl text-slate-300 sm:text-lg">
              PriceNestAI blends modern real estate design with a Flask-powered ML predictor, a Node backend, and a responsive React dashboard for a premium startup experience.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/predict")}
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:bg-cyan-400"
              >
                Try a Price Prediction
              </button>
              <button
                onClick={() => navigate("/properties")}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500"
              >
                Explore Properties
              </button>
              <button
                onClick={() => navigate("/compare")}
                className="inline-flex items-center justify-center rounded-2xl border border-cyan-500 bg-transparent px-6 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/10"
              >
                Compare Homes
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-soft backdrop-blur-sm">
            <div className="space-y-4">
              <div className="text-sm uppercase tracking-[0.24em] text-cyan-300">Instant search</div>
              <div className="text-white text-2xl font-semibold">Natural language property search</div>
              <p className="text-slate-400">
                Type an express query and preview matching results instantly—no login required.
              </p>
              <div className="grid gap-3">
                <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-4">
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Search homes</label>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="min-w-0 flex-1 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                      placeholder="e.g. 2BHK under 50 lakh in Bengaluru"
                    />
                    <button
                      onClick={quickSearch}
                      disabled={loading}
                      className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
                    >
                      {loading ? "Searching..." : "Go"}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500">Search suggestions: Bengaluru, Mumbai, 3BHK below 70 lakh.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="glass-card rounded-[2rem] p-6 shadow-soft">
            <div className="text-sm uppercase tracking-[0.24em] text-cyan-200">{item.label}</div>
            <div className="mt-4 text-3xl font-semibold text-white">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="glass-card rounded-[2rem] p-8 shadow-soft">
          <div className="text-xl font-semibold text-white">What makes PriceNestAI premium?</div>
          <ul className="mt-6 space-y-4 text-slate-300">
            <li className="flex gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
              <span>End-to-end architecture connecting React, Express, MongoDB, and Flask ML.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
              <span>Responsive SaaS-grade interface with smooth gradients and glassmorphism.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
              <span>Built for investor demos and portfolio storytelling.</span>
            </li>
          </ul>
        </div>

        <div className="grid gap-4">
          {testimonials.map((item) => (
            <div key={item.name} className="glass-card rounded-[2rem] p-6 shadow-soft">
              <p className="text-slate-200">“{item.quote}”</p>
              <div className="mt-5 text-sm font-semibold text-white">{item.name}</div>
              <div className="text-slate-400">{item.role}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

