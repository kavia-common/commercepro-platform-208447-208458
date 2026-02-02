import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ErrorBlock } from "../components/ErrorBlock";
import { useAuth } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Authentication page (Sign in / Create account).
 */
export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const from = useMemo(() => location.state?.from || "/catalog", [location.state]);

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@user.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Name is required for registration.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") await login(email.trim(), password);
      else await register(name.trim(), email.trim(), password);

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card cardPad">
        <div className="row">
          <div className="stack">
            <div className="retroTitle">AUTH//TERMINAL</div>
            <div className="muted">Sign in to sync cart, place orders, and write reviews.</div>
          </div>
          <div className="btnRow">
            <button className={`btn ${mode === "login" ? "btnPrimary" : ""}`} onClick={() => setMode("login")}>
              Sign in
            </button>
            <button className={`btn ${mode === "register" ? "btnPrimary" : ""}`} onClick={() => setMode("register")}>
              Create account
            </button>
          </div>
        </div>

        <hr className="hr" />

        <ErrorBlock message={error} />

        <form onSubmit={onSubmit}>
          {mode === "register" && (
            <>
              <label className="fieldLabel">NAME</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
            </>
          )}

          <label className="fieldLabel">EMAIL</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            type="email"
            autoComplete="email"
          />

          <label className="fieldLabel">PASSWORD</label>
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />

          <div className="btnRow" style={{ marginTop: 14 }}>
            <button className="btn btnPrimary" disabled={loading} type="submit">
              {loading ? "Working…" : mode === "login" ? "Enter" : "Create"}
            </button>
            <button className="btn" type="button" onClick={() => navigate("/catalog")}>
              Back to catalog
            </button>
          </div>

          <div className="infoBox" style={{ marginTop: 14 }}>
            Tip: set <span className="kbd">REACT_APP_API_BASE_URL</span> to point to your backend.
          </div>
        </form>
      </div>
    </div>
  );
}
