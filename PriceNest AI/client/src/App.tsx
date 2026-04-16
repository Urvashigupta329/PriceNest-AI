import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./auth/AuthContext";
import { Home } from "./pages/Home";
import { Properties } from "./pages/Properties";
import { PropertyDetails } from "./pages/PropertyDetails";
import { Predict } from "./pages/Predict";
import { Dashboard } from "./pages/Dashboard";
import { AuthPage } from "./pages/Auth";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <main className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/predict" element={<Predict />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/favorites" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

