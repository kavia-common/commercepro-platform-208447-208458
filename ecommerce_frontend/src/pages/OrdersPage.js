import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiListOrders } from "../api/client";
import { ErrorBlock } from "../components/ErrorBlock";
import { LoadingBlock } from "../components/LoadingBlock";
import { useAuth } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Orders list page.
 */
export function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const resp = await apiListOrders(token);
        if (!mounted) return;
        setOrders(resp?.orders || resp || []);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Failed to load orders");
        setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="container">
      <div className="row" style={{ marginBottom: 12 }}>
        <div className="stack">
          <div className="retroTitle">ORDERS//HISTORY</div>
          <div className="muted">Your recent commits.</div>
        </div>
        <Link className="btn" to="/catalog">
          Catalog
        </Link>
      </div>

      <ErrorBlock message={error} />
      {loading ? (
        <LoadingBlock label="Loading orders…" />
      ) : orders.length === 0 ? (
        <div className="card cardPad">
          <div className="retroTitle">NO ORDERS</div>
          <div className="muted">Place an order to see it here.</div>
        </div>
      ) : (
        <div className="card cardPad">
          <table className="table" aria-label="Orders">
            <thead>
              <tr>
                <th>ID</th>
                <th>STATUS</th>
                <th>TOTAL</th>
                <th>CREATED</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const id = o.id || o._id;
                const total = Number(o.total || o.amount || 0);
                return (
                  <tr key={String(id)}>
                    <td className="retroTitle">{String(id)}</td>
                    <td>
                      <span className="badge">{o.status || "unknown"}</span>
                    </td>
                    <td>${total.toFixed(2)}</td>
                    <td className="muted">{String(o.createdAt || o.created_at || "")}</td>
                    <td>
                      <Link className="btn" to={`/orders/${encodeURIComponent(String(id))}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
