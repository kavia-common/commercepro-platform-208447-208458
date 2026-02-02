import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCheckout } from "../api/client";
import { ErrorBlock } from "../components/ErrorBlock";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

/**
 * PUBLIC_INTERFACE
 * Checkout page.
 */
export function CheckoutPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { cart, totals, refresh } = useCart();

  const items = cart?.items || [];
  const subtotal = useMemo(() => Number(totals.subtotal || 0), [totals]);

  const [fullName, setFullName] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card_mock");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function placeOrder(e) {
    e.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Cart is empty.");
      return;
    }
    if (!fullName.trim() || !address1.trim() || !city.trim() || !postal.trim()) {
      setError("All shipping fields are required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        shipping: { fullName: fullName.trim(), address1: address1.trim(), city: city.trim(), postal: postal.trim() },
        payment: { method: paymentMethod },
      };
      const resp = await apiCheckout(token, payload);
      await refresh();
      const orderId = resp?.order?.id || resp?.orderId || resp?.id;
      navigate(orderId ? `/orders/${encodeURIComponent(String(orderId))}` : "/orders", { replace: true });
    } catch (e2) {
      setError(e2.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="row" style={{ marginBottom: 12 }}>
        <div className="stack">
          <div className="retroTitle">CHECKOUT//COMMIT</div>
          <div className="muted">Payment integration placeholder (mock method).</div>
        </div>
        <div className="kbd">Subtotal: ${subtotal.toFixed(2)}</div>
      </div>

      <div className="shell">
        <main className="card cardPad">
          <ErrorBlock message={error} />

          <form onSubmit={placeOrder}>
            <div className="retroTitle">SHIPPING</div>
            <label className="fieldLabel">FULL NAME</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ada Lovelace" />

            <label className="fieldLabel">ADDRESS</label>
            <input className="input" value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="123 Retro Ave" />

            <div className="row">
              <div style={{ flex: 1 }}>
                <label className="fieldLabel">CITY</label>
                <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Neo Tokyo" />
              </div>
              <div style={{ flex: 1 }}>
                <label className="fieldLabel">POSTAL</label>
                <input className="input" value={postal} onChange={(e) => setPostal(e.target.value)} placeholder="00000" />
              </div>
            </div>

            <hr className="hr" />

            <div className="retroTitle">PAYMENT</div>
            <label className="fieldLabel">METHOD</label>
            <select className="select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="card_mock">Card (mock)</option>
              <option value="cash_mock">Cash (mock)</option>
            </select>

            <div className="btnRow" style={{ marginTop: 14 }}>
              <button className="btn btnPrimary" type="submit" disabled={loading}>
                {loading ? "Placing…" : "Place order"}
              </button>
              <button className="btn" type="button" onClick={() => navigate("/cart")}>
                Back to cart
              </button>
            </div>
          </form>
        </main>

        <aside className="card cardPad">
          <div className="retroTitle">SUMMARY</div>
          <div className="muted">Items: {items.reduce((s, it) => s + Number(it.quantity || 0), 0)}</div>
          <hr className="hr" />
          <div className="muted">
            Subtotal <span className="kbd">${subtotal.toFixed(2)}</span>
          </div>
          <div className="infoBox" style={{ marginTop: 12 }}>
            This UI expects <span className="kbd">POST /api/checkout</span>.
          </div>
        </aside>
      </div>
    </div>
  );
}
