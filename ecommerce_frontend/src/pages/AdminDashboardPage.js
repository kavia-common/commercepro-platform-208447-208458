import React, { useEffect, useState } from "react";
import { apiAdminListOrders, apiAdminListProducts, apiAdminSummary, apiAdminUpsertProduct } from "../api/client";
import { ErrorBlock } from "../components/ErrorBlock";
import { LoadingBlock } from "../components/LoadingBlock";
import { useAuth } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Admin dashboard.
 */
export function AdminDashboardPage() {
  const { token } = useAuth();

  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState({ id: "", name: "", price: "", category: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [s, o, p] = await Promise.all([
          apiAdminSummary(token).catch(() => null),
          apiAdminListOrders(token).catch(() => ({ orders: [] })),
          apiAdminListProducts(token).catch(() => ({ products: [] })),
        ]);

        if (!mounted) return;
        setSummary(s?.summary || s);
        setOrders(o?.orders || o || []);
        setProducts(p?.products || p || []);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Failed to load admin data");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  function beginEdit(p) {
    setSaveError("");
    setSaveOk("");
    setEditing({
      id: String(p?.id || ""),
      name: p?.name || p?.title || "",
      price: String(p?.price ?? ""),
      category: p?.category || "",
      description: p?.description || "",
    });
  }

  function resetEdit() {
    setEditing({ id: "", name: "", price: "", category: "", description: "" });
    setSaveError("");
    setSaveOk("");
  }

  async function saveProduct(e) {
    e.preventDefault();
    setSaveError("");
    setSaveOk("");

    if (!editing.name.trim()) {
      setSaveError("Name is required.");
      return;
    }

    const price = Number(editing.price);
    if (Number.isNaN(price) || price < 0) {
      setSaveError("Price must be a valid number.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...(editing.id ? { id: editing.id } : {}),
        name: editing.name.trim(),
        price,
        category: editing.category.trim(),
        description: editing.description.trim(),
      };
      await apiAdminUpsertProduct(token, payload);
      setSaveOk("Saved.");
      // refresh products list
      const p = await apiAdminListProducts(token).catch(() => ({ products: [] }));
      setProducts(p?.products || p || []);
      resetEdit();
    } catch (e2) {
      setSaveError(e2.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container">
      <div className="row" style={{ marginBottom: 12 }}>
        <div className="stack">
          <div className="retroTitle">ADMIN//DASHBOARD</div>
          <div className="muted">Operations console.</div>
        </div>
        <div className="kbd">token-auth enabled</div>
      </div>

      <ErrorBlock message={error} />

      {loading ? (
        <LoadingBlock label="Loading admin telemetry…" />
      ) : (
        <div className="shell">
          <aside className="stack">
            <div className="card cardPad">
              <div className="retroTitle">SUMMARY</div>
              <div className="muted">Optional endpoint: GET /api/admin/summary</div>
              <hr className="hr" />
              <div className="stack">
                <div className="muted">
                  Products: <span className="kbd">{String(summary?.productsCount ?? products.length)}</span>
                </div>
                <div className="muted">
                  Orders: <span className="kbd">{String(summary?.ordersCount ?? orders.length)}</span>
                </div>
                <div className="muted">
                  Revenue: <span className="kbd">${Number(summary?.revenue ?? 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="card cardPad">
              <div className="retroTitle">UPSERT PRODUCT</div>
              <div className="muted">POST/PUT /api/admin/products</div>
              <hr className="hr" />

              <ErrorBlock message={saveError} />
              {saveOk ? <div className="successBox">{saveOk}</div> : null}

              <form onSubmit={saveProduct}>
                <label className="fieldLabel">ID (optional)</label>
                <input className="input" value={editing.id} onChange={(e) => setEditing((p) => ({ ...p, id: e.target.value }))} placeholder="leave empty to create" />

                <label className="fieldLabel">NAME</label>
                <input className="input" value={editing.name} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} placeholder="Retro Keyboard" />

                <label className="fieldLabel">PRICE</label>
                <input className="input" value={editing.price} onChange={(e) => setEditing((p) => ({ ...p, price: e.target.value }))} placeholder="99.99" />

                <label className="fieldLabel">CATEGORY</label>
                <input className="input" value={editing.category} onChange={(e) => setEditing((p) => ({ ...p, category: e.target.value }))} placeholder="hardware" />

                <label className="fieldLabel">DESCRIPTION</label>
                <textarea className="textarea" rows={3} value={editing.description} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} placeholder="Aesthetic clicks, maximum nostalgia." />

                <div className="btnRow" style={{ marginTop: 12 }}>
                  <button className="btn btnPrimary" type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button className="btn" type="button" onClick={resetEdit}>
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </aside>

          <main className="stack">
            <div className="card cardPad">
              <div className="row">
                <div className="retroTitle">PRODUCTS</div>
                <div className="muted">Click a row to edit.</div>
              </div>
              <hr className="hr" />
              <table className="table" aria-label="Admin products">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>NAME</th>
                    <th>CATEGORY</th>
                    <th>PRICE</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={String(p.id || p._id)} onClick={() => beginEdit(p)} style={{ cursor: "pointer" }}>
                      <td className="retroTitle">{String(p.id || p._id)}</td>
                      <td>{p.name || p.title}</td>
                      <td className="muted">{p.category || ""}</td>
                      <td>${Number(p.price || 0).toFixed(2)}</td>
                      <td>
                        <button className="btn" type="button" onClick={(e) => { e.stopPropagation(); beginEdit(p); }}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="muted">
                        No products returned by admin endpoint.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="card cardPad">
              <div className="row">
                <div className="retroTitle">ORDERS</div>
                <div className="muted">Admin feed.</div>
              </div>
              <hr className="hr" />
              <table className="table" aria-label="Admin orders">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>STATUS</th>
                    <th>TOTAL</th>
                    <th>USER</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={String(o.id || o._id)}>
                      <td className="retroTitle">{String(o.id || o._id)}</td>
                      <td>
                        <span className="badge">{o.status || "unknown"}</span>
                      </td>
                      <td>${Number(o.total || o.amount || 0).toFixed(2)}</td>
                      <td className="muted">{o.user?.email || o.userEmail || ""}</td>
                    </tr>
                  ))}
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="muted">
                        No orders returned by admin endpoint.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
