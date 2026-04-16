import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function NavBar() {
  const { auth, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-slate-900 font-semibold"
      : "text-slate-600 hover:text-slate-900";

  return (
    <header className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-bold text-slate-900">
            PriceNest AI
          </Link>
          <span className="hidden sm:inline text-xs text-slate-500">
            Predict & compare homes
          </span>
        </div>

        <nav className="flex items-center gap-2">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/properties" className={linkClass}>
            Properties
          </NavLink>
          <NavLink to="/predict" className={linkClass}>
            Predict
          </NavLink>
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          {auth.token ? (
            <button
              onClick={logout}
              className="ml-2 text-sm text-slate-600 hover:text-slate-900"
            >
              Logout
            </button>
          ) : (
            <NavLink to="/auth" className={linkClass}>
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

