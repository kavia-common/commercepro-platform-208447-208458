import React from "react";

/**
 * PUBLIC_INTERFACE
 * Simple loading indicator.
 */
export function LoadingBlock({ label = "Loading…" }) {
  return (
    <div className="card cardPad">
      <div className="retroTitle">{label}</div>
      <div className="muted">Please wait.</div>
    </div>
  );
}
