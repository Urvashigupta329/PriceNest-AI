import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { auth } = useAuth();
  if (auth.loading) return <div className="p-6">Loading...</div>;
  if (!auth.token) return <Navigate to="/auth" replace />;
  return children;
}

