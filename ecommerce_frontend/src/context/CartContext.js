import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiAddToCart, apiGetCart, apiRemoveCartItem, apiUpdateCartItem } from "../api/client";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

function safeReadLocalCart() {
  try {
    const raw = localStorage.getItem("cp_cart");
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    if (!parsed?.items) return { items: [] };
    return parsed;
  } catch {
    return { items: [] };
  }
}

function safeWriteLocalCart(cart) {
  try {
    localStorage.setItem("cp_cart", JSON.stringify(cart));
  } catch {
    // ignore
  }
}

/**
 * PUBLIC_INTERFACE
 * Provider for cart state.
 */
export function CartProvider({ children }) {
  const { token } = useAuth();
  const [cart, setCart] = useState(() => safeReadLocalCart());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setError("");
    if (!token) {
      setCart(safeReadLocalCart());
      return;
    }
    setLoading(true);
    try {
      const serverCart = await apiGetCart(token);
      setCart(serverCart?.cart || serverCart);
    } catch (e) {
      setError(e.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!token) safeWriteLocalCart(cart);
  }, [cart, token]);

  const addItem = useCallback(
    async ({ product, productId, quantity }) => {
      setError("");
      const qty = Math.max(1, Number(quantity || 1));
      if (!token) {
        // local cart item shape (guest)
        setCart((prev) => {
          const items = [...(prev?.items || [])];
          const id = String(productId || product?.id);
          const idx = items.findIndex((it) => String(it.productId) === id);
          if (idx >= 0) items[idx] = { ...items[idx], quantity: items[idx].quantity + qty };
          else
            items.push({
              id: `local_${id}`,
              productId: id,
              quantity: qty,
              product: product || null,
            });
          return { ...prev, items };
        });
        return;
      }

      await apiAddToCart(token, { productId: String(productId || product?.id), quantity: qty });
      await refresh();
    },
    [token, refresh]
  );

  const updateQty = useCallback(
    async (itemId, quantity) => {
      setError("");
      const qty = Math.max(1, Number(quantity || 1));

      if (!token) {
        setCart((prev) => {
          const items = (prev?.items || []).map((it) => (it.id === itemId ? { ...it, quantity: qty } : it));
          return { ...prev, items };
        });
        return;
      }

      await apiUpdateCartItem(token, { itemId, quantity: qty });
      await refresh();
    },
    [token, refresh]
  );

  const removeItem = useCallback(
    async (itemId) => {
      setError("");
      if (!token) {
        setCart((prev) => {
          const items = (prev?.items || []).filter((it) => it.id !== itemId);
          return { ...prev, items };
        });
        return;
      }

      await apiRemoveCartItem(token, itemId);
      await refresh();
    },
    [token, refresh]
  );

  const totals = useMemo(() => {
    const items = cart?.items || [];
    const subtotal = items.reduce((sum, it) => {
      const price = Number(it?.product?.price || it?.price || 0);
      return sum + price * Number(it.quantity || 0);
    }, 0);
    return { subtotal };
  }, [cart]);

  const value = useMemo(
    () => ({ cart, loading, error, refresh, addItem, updateQty, removeItem, totals }),
    [cart, loading, error, refresh, addItem, updateQty, removeItem, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Hook for accessing cart state.
 */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
