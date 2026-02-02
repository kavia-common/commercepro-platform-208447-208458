import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

/**
 * PUBLIC_INTERFACE
 * Top navigation bar.
 */
export function Navbar({ theme, onToggleTheme }) {
  const { isAuthed, user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const count = (cart?.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0);
  const isAdmin = Boolean(user?.role === "admin" || user?.isAdmin);

  return (
    <div className="navbar">
      <div className="container navbarInner">
        <div className="brand">
          <span className="brandMark" aria-hidden="true" />
          <NavLink to="/" className="retroTitle" style={{ textDecoration: "none" }}>
            COMMERCEPRO//RETRO
          </NavLink>
          <span className="kbd">v0.1</span>
        </div>

        <div className="navLinks" aria-label="Primary">
          <NavLink to="/catalog" className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}>
            Catalog
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}>
            Orders
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}>
            Cart <span className="badge">{count}</span>
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}>
              Admin
            </NavLink>
          )}

          <button className="btn" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === "light" ? "Dark" : "Light"}
          </button>

          {!isAuthed ? (
            <NavLink to="/auth" className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}>
              Sign in
            </NavLink>
          ) : (
            <div className="navLinks">
              <span className="kbd">{user?.email || "user"}</span>
              <button
                className="btn"
                onClick={() => {
                  logout();
                  navigate("/catalog");
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
