import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingBlock } from "./LoadingBlock";

/**
 * PUBLIC_INTERFACE
 * Guard component for admin-only pages.
 */
export function RequireAdmin({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingBlock label="Checking access…" />;

  const isAdmin = Boolean(user?.role === "admin" || user?.isAdmin);
  if (!isAdmin) return <Navigate to="/catalog" replace />;
  return children;
}
