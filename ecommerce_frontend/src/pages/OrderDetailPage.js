import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGetOrder } from "../api/client";
import { ErrorBlock } from "../components/ErrorBlock";
import { LoadingBlock } from "../components/LoadingBlock";
import { useAuth } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Order detail page.
 */
export function OrderDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const resp = await apiGetOrder(token, id);
        if (!mounted) return;
        setOrder(resp?.order || resp);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Failed to load order");
        setOrder(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [token, id]);

  return (
    <div className="container">
      <div className="btnRow" style={{ marginBottom: 12 }}>
        <Link className="btn" to="/orders">
          ← Orders
        </Link>
        <Link className="btn" to="/catalog">
          Catalog
        </Link>
      </div>

      <ErrorBlock message={error} />
      {loading ? (
        <LoadingBlock label="Loading order…" />
      ) : !order ? (
        <div className="card cardPad">
          <div className="retroTitle">NOT FOUND</div>
          <div className="muted">Order record missing or inaccessible.</div>
        </div>
      ) : (
        <div className="card cardPad">
          <div className="row">
            <div className="stack">
              <div className="retroTitle">ORDER//{String(order.id || id)}</div>
              <div className="muted">
                Status: <span className="badge">{order.status || "unknown"}</span>
              </div>
            </div>
            <div className="kbd">${Number(order.total || order.amount || 0).toFixed(2)}</div>
          </div>

          <hr className="hr" />

          <div className="retroTitle">ITEMS</div>
          <div className="muted">Line items returned by backend.</div>
          <hr className="hr" />

          <div className="stack">
            {(order.items || order.lineItems || []).map((it, idx) => (
              <div key={String(it.id || idx)} className="card cardPad" style={{ boxShadow: "none" }}>
                <div className="row">
                  <div className="retroTitle">{it.product?.name || it.name || "Item"}</div>
                  <div className="kbd">
                    {Number(it.quantity || 0)} × ${Number(it.price || it.product?.price || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            {(order.items || order.lineItems || []).length === 0 ? (
              <div className="muted">No item details provided.</div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
