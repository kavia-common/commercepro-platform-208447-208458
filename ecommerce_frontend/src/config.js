/**
 * Central configuration for the frontend.
 * Uses environment variables where available.
 */

const DEFAULT_API_BASE_URL = "http://localhost:3001";

/**
 * PUBLIC_INTERFACE
 * @returns {string} Backend REST API base URL.
 */
export function getApiBaseUrl() {
  // CRA exposes env vars prefixed with REACT_APP_
  return process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL;
}
