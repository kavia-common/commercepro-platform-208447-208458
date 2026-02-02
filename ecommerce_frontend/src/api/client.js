import { httpRequest } from "./http";

/**
 * Backend endpoints are assumed to follow common conventions.
 * If the backend differs, update paths here only (single source of truth).
 */

// ---------- Auth ----------
/** PUBLIC_INTERFACE */
export async function apiLogin({ email, password }) {
  return httpRequest("/api/auth/login", { method: "POST", body: { email, password } });
}

/** PUBLIC_INTERFACE */
export async function apiRegister({ name, email, password }) {
  return httpRequest("/api/auth/register", { method: "POST", body: { name, email, password } });
}

/** PUBLIC_INTERFACE */
export async function apiMe(token) {
  return httpRequest("/api/auth/me", { method: "GET", token });
}

// ---------- Products ----------
/** PUBLIC_INTERFACE */
export async function apiListProducts({ q, category } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return httpRequest(`/api/products${qs}`, { method: "GET" });
}

/** PUBLIC_INTERFACE */
export async function apiGetProduct(productId) {
  return httpRequest(`/api/products/${encodeURIComponent(productId)}`, { method: "GET" });
}

/** PUBLIC_INTERFACE */
export async function apiListCategories() {
  return httpRequest("/api/categories", { method: "GET" });
}

// ---------- Reviews ----------
/** PUBLIC_INTERFACE */
export async function apiListReviews(productId) {
  return httpRequest(`/api/products/${encodeURIComponent(productId)}/reviews`, { method: "GET" });
}

/** PUBLIC_INTERFACE */
export async function apiCreateReview(productId, token, { rating, title, body }) {
  return httpRequest(`/api/products/${encodeURIComponent(productId)}/reviews`, {
    method: "POST",
    token,
    body: { rating, title, body },
  });
}

// ---------- Cart ----------
/** PUBLIC_INTERFACE */
export async function apiGetCart(token) {
  return httpRequest("/api/cart", { method: "GET", token });
}

/** PUBLIC_INTERFACE */
export async function apiAddToCart(token, { productId, quantity }) {
  return httpRequest("/api/cart/items", { method: "POST", token, body: { productId, quantity } });
}

/** PUBLIC_INTERFACE */
export async function apiUpdateCartItem(token, { itemId, quantity }) {
  return httpRequest(`/api/cart/items/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    token,
    body: { quantity },
  });
}

/** PUBLIC_INTERFACE */
export async function apiRemoveCartItem(token, itemId) {
  return httpRequest(`/api/cart/items/${encodeURIComponent(itemId)}`, { method: "DELETE", token });
}

// ---------- Checkout / Orders ----------
/** PUBLIC_INTERFACE */
export async function apiCheckout(token, payload) {
  return httpRequest("/api/checkout", { method: "POST", token, body: payload });
}

/** PUBLIC_INTERFACE */
export async function apiListOrders(token) {
  return httpRequest("/api/orders", { method: "GET", token });
}

/** PUBLIC_INTERFACE */
export async function apiGetOrder(token, orderId) {
  return httpRequest(`/api/orders/${encodeURIComponent(orderId)}`, { method: "GET", token });
}

// ---------- Admin ----------
/** PUBLIC_INTERFACE */
export async function apiAdminSummary(token) {
  return httpRequest("/api/admin/summary", { method: "GET", token });
}

/** PUBLIC_INTERFACE */
export async function apiAdminListOrders(token) {
  return httpRequest("/api/admin/orders", { method: "GET", token });
}

/** PUBLIC_INTERFACE */
export async function apiAdminListProducts(token) {
  return httpRequest("/api/admin/products", { method: "GET", token });
}

/** PUBLIC_INTERFACE */
export async function apiAdminUpsertProduct(token, product) {
  const hasId = Boolean(product?.id);
  const path = hasId
    ? `/api/admin/products/${encodeURIComponent(product.id)}`
    : "/api/admin/products";
  const method = hasId ? "PUT" : "POST";
  return httpRequest(path, { method, token, body: product });
}
