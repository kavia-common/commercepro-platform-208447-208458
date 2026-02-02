import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiCreateReview, apiGetProduct, apiListReviews } from "../api/client";
import { ErrorBlock } from "../components/ErrorBlock";
import { LoadingBlock } from "../components/LoadingBlock";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

/**
 * PUBLIC_INTERFACE
 * Product detail page including reviews.
 */
export function ProductDetailPage() {
  const { id } = useParams();
  const { token, isAuthed } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  const price = useMemo(() => Number(product?.price || 0), [product]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const p = await apiGetProduct(id);
        if (!mounted) return;
        setProduct(p?.product || p);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Failed to load product");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    async function loadReviews() {
      setReviewsLoading(true);
      try {
        const resp = await apiListReviews(id);
        if (!mounted) return;
        setReviews(resp?.reviews || resp || []);
      } catch {
        if (!mounted) return;
        setReviews([]);
      } finally {
        if (mounted) setReviewsLoading(false);
      }
    }
    loadReviews();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function submitReview(e) {
    e.preventDefault();
    setPostError("");

    if (!isAuthed) {
      setPostError("Sign in required to write reviews.");
      return;
    }
    if (!title.trim() || !body.trim()) {
      setPostError("Title and body are required.");
      return;
    }

    setPosting(true);
    try {
      await apiCreateReview(id, token, { rating: Number(rating), title: title.trim(), body: body.trim() });
      setTitle("");
      setBody("");
      // refresh
      const resp = await apiListReviews(id);
      setReviews(resp?.reviews || resp || []);
    } catch (e2) {
      setPostError(e2.message || "Failed to post review");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="container">
      <div className="btnRow" style={{ marginBottom: 12 }}>
        <Link className="btn" to="/catalog">
          ← Back
        </Link>
        <Link className="btn" to="/cart">
          Cart
        </Link>
      </div>

      <ErrorBlock message={error} />
      {loading ? (
        <LoadingBlock label="Loading product…" />
      ) : !product ? (
        <div className="card cardPad">
          <div className="retroTitle">NOT FOUND</div>
          <div className="muted">This product signal does not exist.</div>
        </div>
      ) : (
        <div className="shell">
          <main className="card cardPad">
            <div className="row">
              <div className="stack">
                <div className="retroTitle">PRODUCT//{String(product.id || id)}</div>
                <div className="productTitle">{product.name || product.title}</div>
                <div className="muted">{product.description || "No description."}</div>
              </div>
              <div className="stack" style={{ alignItems: "flex-end" }}>
                <div className="kbd">${price.toFixed(2)}</div>
                <button className="btn btnPrimary" onClick={() => addItem({ product, productId: String(product.id || id), quantity: 1 })}>
                  Add to cart
                </button>
              </div>
            </div>

            <hr className="hr" />

            <div className="row">
              <div className="stack">
                <div className="retroTitle">SPECS</div>
                <div className="muted">
                  Category: <span className="kbd">{product.category || "n/a"}</span>
                </div>
              </div>
              <div className="stack" style={{ alignItems: "flex-end" }}>
                <div className="muted">Stock: <span className="kbd">{String(product.stock ?? "n/a")}</span></div>
              </div>
            </div>
          </main>

          <aside className="stack">
            <div className="card cardPad">
              <div className="retroTitle">REVIEWS</div>
              <div className="muted">User telemetry for this item.</div>
              <hr className="hr" />

              {reviewsLoading ? (
                <div className="muted">Loading reviews…</div>
              ) : reviews.length === 0 ? (
                <div className="muted">No reviews yet.</div>
              ) : (
                <div className="stack">
                  {reviews.map((r) => (
                    <div key={String(r.id || r._id || `${r.title}-${r.createdAt}`)} className="card cardPad" style={{ boxShadow: "none" }}>
                      <div className="row">
                        <div className="retroTitle">{r.title || "Review"}</div>
                        <span className="kbd">{Number(r.rating || 0)}/5</span>
                      </div>
                      <div className="muted">{r.body || r.comment || ""}</div>
                      <div className="muted" style={{ marginTop: 8 }}>
                        by <span className="kbd">{r.user?.email || r.userEmail || "anon"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card cardPad">
              <div className="retroTitle">WRITE REVIEW</div>
              <div className="muted">Auth required.</div>
              <hr className="hr" />

              <ErrorBlock message={postError} />

              <form onSubmit={submitReview}>
                <label className="fieldLabel">RATING</label>
                <select className="select" value={rating} onChange={(e) => setRating(e.target.value)}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>

                <label className="fieldLabel">TITLE</label>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Signal quality…" />

                <label className="fieldLabel">BODY</label>
                <textarea className="textarea" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Describe your experience…" />

                <div className="btnRow" style={{ marginTop: 12 }}>
                  <button className="btn btnPrimary" type="submit" disabled={posting}>
                    {posting ? "Posting…" : "Submit"}
                  </button>
                  {!isAuthed ? (
                    <Link className="btn" to="/auth">
                      Sign in
                    </Link>
                  ) : null}
                </div>
              </form>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
