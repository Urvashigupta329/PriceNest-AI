import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./auth/AuthContext";
import { ToastProvider } from "./components/ToastProvider";
import { Home } from "./pages/Home";
import { Properties } from "./pages/Properties";
import { PropertyDetails } from "./pages/PropertyDetails";
import { Predict } from "./pages/Predict";
import { Compare } from "./pages/Compare";
import { Dashboard } from "./pages/Dashboard";
import { AuthPage } from "./pages/Auth";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#0e1725_100%)] text-slate-100">
          <NavBar />
          <main className="max-w-6xl mx-auto px-4 py-8 lg:py-10"> 
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              <Route path="/predict" element={<Predict />} />
              <Route path="/compare" element={<Compare />} />
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
      </ToastProvider>
    </AuthProvider>
  );
}

