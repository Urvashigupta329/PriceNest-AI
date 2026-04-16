import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/ToastProvider";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200)
});

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(200)
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const {
    register: rhRegister,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<any>({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema)
  });

  async function onSubmit(values: LoginValues & RegisterValues) {
    setError(null);
    try {
      if (mode === "login") {
        await login(values.email, values.password);
        showToast("Welcome back!", "success");
      } else {
        await register(values.name, values.email, values.password);
        showToast("Account created successfully!", "success");
      }
    } catch (e: any) {
      const message = e?.response?.data?.error ?? "Authentication failed";
      setError(message);
      showToast(message, "error");
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center py-8">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card rounded-[2rem] border-slate-700 p-10 shadow-soft">
          <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">PriceNestAI</div>
          <h1 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">Fast login for smarter property decisions.</h1>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Access your dashboard, save favorites, and use the AI pricing engine with a secure account. Designed for a polished startup experience.
          </p>
          <div className="mt-8 grid gap-4 text-slate-300">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="text-sm text-slate-400">Trusted architecture</div>
              <div className="mt-2 text-white">Secure JWT auth with modern session control.</div>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="text-sm text-slate-400">Productivity boost</div>
              <div className="mt-2 text-white">Save predictions, see property trends, and compare investments.</div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] border-slate-700 p-8 shadow-soft">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">{mode === "login" ? "Welcome back" : "Create an account"}</h2>
              <p className="text-sm text-slate-400">{mode === "login" ? "Login to continue" : "Start using the platform today."}</p>
            </div>
            <button
              onClick={() => {
                setMode((m) => (m === "login" ? "register" : "login"));
                setError(null);
              }}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-cyan-300 transition hover:bg-slate-900"
            >
              {mode === "login" ? "Register" : "Login"}
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {mode === "register" ? (
              <label className="block text-sm text-slate-300">
                <span>Name</span>
                <input
                  {...rhRegister("name")}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  placeholder="Your full name"
                />
                {errors.name ? <span className="text-sm text-rose-400">{errors.name.message as string}</span> : null}
              </label>
            ) : null}

            <label className="block text-sm text-slate-300">
              <span>Email</span>
              <input
                {...rhRegister("email")}
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                placeholder="you@example.com"
              />
              {errors.email ? <span className="text-sm text-rose-400">{errors.email.message as string}</span> : null}
            </label>

            <label className="block text-sm text-slate-300">
              <span>Password</span>
              <input
                {...rhRegister("password")}
                type="password"
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                placeholder="At least 6 characters"
              />
              {errors.password ? <span className="text-sm text-rose-400">{errors.password.message as string}</span> : null}
            </label>

            {error ? (
              <div className="rounded-3xl bg-rose-950/80 border border-rose-700 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
            >
              {isSubmitting ? "Loading..." : mode === "login" ? "Login" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

