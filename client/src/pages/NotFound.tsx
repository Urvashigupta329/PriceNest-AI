import React from "react";
import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="max-w-xl mx-auto text-center mt-16">
      <div className="text-5xl font-bold text-slate-900">404</div>
      <div className="mt-2 text-slate-600">Page not found.</div>
      <Link to="/" className="mt-6 inline-block text-slate-900 underline">
        Go back Home
      </Link>
    </div>
  );
}

