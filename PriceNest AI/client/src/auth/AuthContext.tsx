import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/axios";

type User = { id: string; name: string; email: string; role: "user" | "admin" };
type AuthState = { token: string | null; user: User | null; loading: boolean };

type AuthContextValue = {
  auth: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readToken(): string | null {
  return localStorage.getItem("token");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    token: readToken(),
    user: null,
    loading: true
  });

  useEffect(() => {
    // We keep this beginner-friendly: token persistence only. Backend already handles JWT validation.
    setAuth((s) => ({ ...s, loading: false }));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      login: async (email, password) => {
        const resp = await api.post("/api/auth/login", { email, password });
        const { token, user } = resp.data as { token: string; user: User };
        localStorage.setItem("token", token);
        setAuth({ token, user, loading: false });
      },
      register: async (name, email, password) => {
        const resp = await api.post("/api/auth/register", { name, email, password });
        // Backend returns created user; for convenience, immediately login.
        await api.post("/api/auth/login", { email, password }).then((r) => {
          const { token, user } = r.data as { token: string; user: User };
          localStorage.setItem("token", token);
          setAuth({ token, user, loading: false });
        });
      },
      logout: () => {
        localStorage.removeItem("token");
        setAuth({ token: null, user: null, loading: false });
      }
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

