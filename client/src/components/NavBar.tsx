import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function NavBar() {
  const { auth, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-cyan-300 font-semibold"
      : "text-slate-300 hover:text-white transition";

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-[0_10px_60px_-30px_rgba(15,23,42,0.7)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 text-white">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500 text-sm font-bold shadow-lg shadow-cyan-500/20">PN</span>
          <div>
            <div className="font-semibold">PriceNest AI</div>
            <div className="text-xs text-slate-400">Predict. Compare. Invest.</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/properties" className={linkClass}>
            Properties
          </NavLink>
          <NavLink to="/predict" className={linkClass}>
            Predict
          </NavLink>
          <NavLink to="/compare" className={linkClass}>
            Compare
          </NavLink>
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {auth.user ? (
            <>
              <div className="rounded-full bg-slate-900/90 px-4 py-2 text-sm text-slate-200">{auth.user.name}</div>
              <button
                onClick={logout}
                className="rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

