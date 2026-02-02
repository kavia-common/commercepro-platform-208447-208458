import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiLogin, apiMe, apiRegister } from "../api/client";

const AuthContext = createContext(null);

function getStoredToken() {
  try {
    return localStorage.getItem("cp_token") || "";
  } catch {
    return "";
  }
}

/**
 * PUBLIC_INTERFACE
 * Provider for authentication state.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      if (token) localStorage.setItem("cp_token", token);
      else localStorage.removeItem("cp_token");
    } catch {
      // ignore storage failures
    }
  }, [token]);

  const refreshMe = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const me = await apiMe(token);
      setUser(me?.user || me);
    } catch (e) {
      setUser(null);
      setToken("");
      setError(e.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(async (email, password) => {
    setError("");
    const resp = await apiLogin({ email, password });
    const newToken = resp?.token || resp?.accessToken || "";
    if (!newToken) throw new Error("Login succeeded but no token returned by API.");
    setToken(newToken);
    return newToken;
  }, []);

  const register = useCallback(async (name, email, password) => {
    setError("");
    const resp = await apiRegister({ name, email, password });
    const newToken = resp?.token || resp?.accessToken || "";
    if (newToken) setToken(newToken);
    return resp;
  }, []);

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
    setError("");
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      error,
      isAuthed: Boolean(token),
      login,
      register,
      logout,
      refreshMe,
    }),
    [token, user, loading, error, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Hook for accessing auth state.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
