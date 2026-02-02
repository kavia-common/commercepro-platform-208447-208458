import React from "react";

/**
 * PUBLIC_INTERFACE
 * Simple error message block.
 */
export function ErrorBlock({ message }) {
  if (!message) return null;
  return <div className="errorBox">{message}</div>;
}
