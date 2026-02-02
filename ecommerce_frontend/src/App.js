import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import { Navbar } from "./components/Navbar";
import { RequireAdmin } from "./components/RequireAdmin";
import { RequireAuth } from "./components/RequireAuth";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import { HomePage } from "./pages/HomePage";
import { AuthPage } from "./pages/AuthPage";
import { CatalogPage } from "./pages/CatalogPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState("dark");

  // Apply theme to document element (allowed global side-effect via useEffect)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Navbar theme={theme} onToggleTheme={toggleTheme} />

            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />

              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />

              <Route path="/cart" element={<CartPage />} />

              <Route
                path="/checkout"
                element={
                  <RequireAuth>
                    <CheckoutPage />
                  </RequireAuth>
                }
              />

              <Route
                path="/orders"
                element={
                  <RequireAuth>
                    <OrdersPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <RequireAuth>
                    <OrderDetailPage />
                  </RequireAuth>
                }
              />

              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <RequireAdmin>
                      <AdminDashboardPage />
                    </RequireAdmin>
                  </RequireAuth>
                }
              />

              <Route
                path="*"
                element={
                  <div className="container">
                    <div className="card cardPad">
                      <div className="retroTitle">404//NO ROUTE</div>
                      <div className="muted">The requested path does not exist.</div>
                    </div>
                  </div>
                }
              />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
