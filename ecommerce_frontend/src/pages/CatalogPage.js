import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiListCategories, apiListProducts } from "../api/client";
import { ErrorBlock } from "../components/ErrorBlock";
import { LoadingBlock } from "../components/LoadingBlock";
import { useCart } from "../context/CartContext";

/**
 * PUBLIC_INTERFACE
 * Product catalog with search + category sidebar.
 */
export function CatalogPage() {
  const { addItem } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [catsLoading, setCatsLoading] = useState(true);
  const [error, setError] = useState("");

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const [queryDraft, setQueryDraft] = useState(q);

  const activeCategoryLabel = useMemo(() => {
    const found = categories.find((c) => String(c.slug || c.id || c.name) === String(category));
    return found?.name || category || "All";
  }, [categories, category]);

  useEffect(() => {
    setQueryDraft(q);
  }, [q]);

  useEffect(() => {
    let mounted = true;

    async function loadCats() {
      setCatsLoading(true);
      try {
        const resp = await apiListCategories();
        if (!mounted) return;
        setCategories(resp?.categories || resp || []);
      } catch {
        // If categories endpoint doesn't exist yet, allow UI to function with empty list.
        if (!mounted) return;
        setCategories([]);
      } finally {
        if (mounted) setCatsLoading(false);
      }
    }

    loadCats();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        const resp = await apiListProducts({ q, category });
        if (!mounted) return;
        setProducts(resp?.products || resp || []);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Failed to load products");
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      mounted = false;
    };
  }, [q, category]);

  function applySearch(e) {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (queryDraft.trim()) next.set("q", queryDraft.trim());
    else next.delete("q");
    setSearchParams(next);
  }

  function setCategory(catValue) {
    const next = new URLSearchParams(searchParams);
    if (catValue) next.set("category", catValue);
    else next.delete("category");
    setSearchParams(next);
  }

  return (
    <div className="container">
      <div className="row" style={{ marginBottom: 12 }}>
        <div className="stack">
          <div className="retroTitle">CATALOG//BROWSE</div>
          <div className="muted">
            Category: <span className="kbd">{activeCategoryLabel}</span>
            {q ? (
              <>
                {" "}
                • Query: <span className="kbd">{q}</span>
              </>
            ) : null}
          </div>
        </div>
        <form onSubmit={applySearch} className="btnRow" style={{ gap: 8 }}>
          <input className="input" value={queryDraft} onChange={(e) => setQueryDraft(e.target.value)} placeholder="Search products…" />
          <button className="btn btnPrimary" type="submit">
            Search
          </button>
          <Link className="btn" to="/cart">
            Go to cart
          </Link>
        </form>
      </div>

      <div className="shell">
        <aside className="card cardPad">
          <div className="retroTitle">CATEGORIES</div>
          <div className="muted" style={{ marginTop: 6 }}>
            Filter signal routed via URL.
          </div>
          <hr className="hr" />

          <div className="stack">
            <button className={`btn ${!category ? "btnPrimary" : ""}`} onClick={() => setCategory("")} disabled={catsLoading}>
              All
            </button>

            {categories.map((c) => {
              const key = String(c.slug || c.id || c.name);
              const label = c.name || key;
              const active = String(category) === key;
              return (
                <button key={key} className={`btn ${active ? "btnPrimary" : ""}`} onClick={() => setCategory(key)} disabled={catsLoading}>
                  {label}
                </button>
              );
            })}

            {catsLoading ? <div className="muted">Loading categories…</div> : null}
          </div>
        </aside>

        <main className="stack">
          <ErrorBlock message={error} />
          {loading ? (
            <LoadingBlock label="Loading products…" />
          ) : products.length === 0 ? (
            <div className="card cardPad">
              <div className="retroTitle">NO RESULTS</div>
              <div className="muted">Try a different query or category.</div>
            </div>
          ) : (
            <div className="grid">
              {products.map((p) => {
                const id = p.id || p._id || p.sku || p.slug;
                const price = Number(p.price || 0);
                return (
                  <div key={String(id)} className="card cardPad">
                    <div className="row">
                      <span className="badge">{p.category || "product"}</span>
                      <span className="kbd">${price.toFixed(2)}</span>
                    </div>

                    <div className="productTitle">{p.name || p.title || "Untitled Product"}</div>
                    <div className="muted" style={{ minHeight: 40 }}>
                      {(p.description || "").slice(0, 80) || "Retro-grade item. Signal: unknown."}
                    </div>

                    <div className="btnRow" style={{ marginTop: 12 }}>
                      <Link className="btn" to={`/products/${encodeURIComponent(String(id))}`}>
                        Details
                      </Link>
                      <button
                        className="btn btnPrimary"
                        onClick={() => addItem({ product: p, productId: String(id), quantity: 1 })}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="infoBox">
            If the backend endpoints differ, update <span className="kbd">src/api/client.js</span>.
          </div>
        </main>
      </div>
    </div>
  );
}
