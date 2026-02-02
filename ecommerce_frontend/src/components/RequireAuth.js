import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingBlock } from "./LoadingBlock";

/**
 * PUBLIC_INTERFACE
 * Guard component for pages that require authentication.
 */
export function RequireAuth({ children }) {
  const { isAuthed, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingBlock label="Booting session…" />;
  if (!isAuthed) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  return children;
}
