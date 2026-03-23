import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../auth/AuthContext";

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
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register: rhRegister,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<any>({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema)
  });

  async function onSubmit(values: LoginValues & RegisterValues) {
    setError(null);
    setSuccess(null);
    try {
      if (mode === "login") {
        await login(values.email, values.password);
        setSuccess("Login successfully");
      } else {
        await register(values.name, values.email, values.password);
        setSuccess("Sign up successfully");
      }
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Authentication failed");
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="font-bold text-slate-900 text-xl">
          {mode === "login" ? "Login" : "Sign Up"}
        </div>
        <button
          onClick={() => {
            setMode((m) => (m === "login" ? "register" : "login"));
            setError(null);
            setSuccess(null);
          }}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          Switch to {mode === "login" ? "Sign Up" : "Login"}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        {mode === "register" ? (
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-700">Name</span>
            <input
              {...rhRegister("name")}
              className="border border-slate-200 rounded-lg px-3 py-2"
              placeholder="Your name"
            />
            {errors.name ? (
              <span className="text-xs text-red-600">{errors.name.message as string}</span>
            ) : null}
          </label>
        ) : null}

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-700">Email</span>
          <input
            {...rhRegister("email")}
            className="border border-slate-200 rounded-lg px-3 py-2"
            placeholder="you@example.com"
          />
          {errors.email ? (
            <span className="text-xs text-red-600">{errors.email.message as string}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-700">Password</span>
          <input
            {...rhRegister("password")}
            type="password"
            className="border border-slate-200 rounded-lg px-3 py-2"
            placeholder="At least 6 characters"
          />
          {errors.password ? (
            <span className="text-xs text-red-600">{errors.password.message as string}</span>
          ) : null}
        </label>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-60"
        >
          {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
        </button>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-3">
            {success}
          </div>
        ) : null}
      </form>
    </div>
  );
}

