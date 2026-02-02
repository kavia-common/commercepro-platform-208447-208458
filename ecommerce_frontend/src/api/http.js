import { getApiBaseUrl } from "../config";

/**
 * Parse response as JSON when possible, otherwise return text.
 */
async function parseBody(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  const text = await res.text();
  return text;
}

/**
 * PUBLIC_INTERFACE
 * Basic HTTP client for backend calls with:
 * - base URL
 * - JSON request/response
 * - bearer auth header (if token provided)
 *
 * @param {string} path URL path (e.g. "/api/products")
 * @param {object} options fetch options + { token?: string }
 * @returns {Promise<any>} parsed response body
 */
export async function httpRequest(path, options = {}) {
  const { token, headers, ...fetchOptions } = options;

  const url = `${getApiBaseUrl()}${path}`;
  const mergedHeaders = {
    Accept: "application/json",
    ...(headers || {}),
  };

  if (token) mergedHeaders.Authorization = `Bearer ${token}`;

  // If body is a plain object, send JSON.
  if (
    fetchOptions.body &&
    typeof fetchOptions.body === "object" &&
    !(fetchOptions.body instanceof FormData)
  ) {
    mergedHeaders["Content-Type"] = "application/json";
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  const res = await fetch(url, { ...fetchOptions, headers: mergedHeaders });
  const body = await parseBody(res);

  if (!res.ok) {
    const message =
      typeof body === "string"
        ? body
        : body?.message || body?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}
