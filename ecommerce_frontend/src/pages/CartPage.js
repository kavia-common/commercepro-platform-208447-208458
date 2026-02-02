import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ErrorBlock } from "../components/ErrorBlock";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

/**
 * PUBLIC_INTERFACE
 * Cart page.
 */
export function CartPage() {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const { cart, loading, error, updateQty, removeItem, totals } = useCart();

  const items = cart?.items || [];

  return (
    <div className="container">
      <div className="row" style={{ marginBottom: 12 }}>
        <div className="stack">
          <div className="retroTitle">CART//BUFFER</div>
          <div className="muted">Guest carts are stored locally; sign in to sync.</div>
        </div>
        <div className="btnRow">
          <Link className="btn" to="/catalog">
            Continue shopping
          </Link>
          <button
            className="btn btnPrimary"
            disabled={items.length === 0 || loading}
            onClick={() => {
              if (!isAuthed) navigate("/auth", { state: { from: "/checkout" } });
              else navigate("/checkout");
            }}
          >
            Checkout
          </button>
        </div>
      </div>

      <ErrorBlock message={error} />

      {items.length === 0 ? (
        <div className="card cardPad">
          <div className="retroTitle">EMPTY</div>
          <div className="muted">Your cart buffer contains no items.</div>
        </div>
      ) : (
        <div className="card cardPad">
          <table className="table" aria-label="Cart items">
            <thead>
              <tr>
                <th>ITEM</th>
                <th>QTY</th>
                <th>PRICE</th>
                <th>LINE</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const title = it.product?.name || it.product?.title || it.name || "Item";
                const price = Number(it.product?.price || it.price || 0);
                const line = price * Number(it.quantity || 0);
                return (
                  <tr key={String(it.id)}>
                    <td>
                      <div className="stack" style={{ gap: 4 }}>
                        <div className="retroTitle">{title}</div>
                        <div className="muted">
                          ProductId: <span className="kbd">{String(it.productId || it.product?.id || "n/a")}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ width: 120 }}>
                      <input
                        className="input"
                        type="number"
                        min={1}
                        value={it.quantity || 1}
                        onChange={(e) => updateQty(String(it.id), e.target.value)}
                        aria-label={`Quantity for ${title}`}
                      />
                    </td>
                    <td>${price.toFixed(2)}</td>
                    <td>${line.toFixed(2)}</td>
                    <td style={{ width: 1, whiteSpace: "nowrap" }}>
                      <button className="btn btnDanger" onClick={() => removeItem(String(it.id))}>
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="row" style={{ marginTop: 14 }}>
            <div className="muted">
              Subtotal <span className="kbd">${Number(totals.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="btnRow">
              <Link className="btn" to="/checkout">
                Go to checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
