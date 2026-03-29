import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useSession } from "../context/SessionContext";
import { createOrder, validateCheckout } from "../services/orderService";
import { getCustomerProfile, saveCustomerProfile } from "../services/profileService";
import "./Checkout.css";

const defaultForm = {
  name: "",
  phone: "",
  address: "",
  orderType: "Dine-in",
  payment: "Cash",
  receiptName: "",
  notes: ""
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, total, clearCart } = useCart();
  const { user, isAuthenticated, isGuest } = useSession();
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getCustomerProfile();
      if (!profile) return;
      setForm((prev) => ({
        ...prev,
        name: profile?.fullName || user?.fullName || "",
        phone: profile?.phone || "",
        address: profile?.address || ""
      }));
    };

    loadProfile();
  }, [user?.fullName]);

  const payload = useMemo(
    () => ({
      customerId: user?.id || "guest",
      customer: {
        name: form.name,
        phone: form.phone,
        address: form.address,
        email: user?.email || ""
      },
      orderType: form.orderType,
      payment: form.payment,
      receiptName: form.receiptName,
      notes: form.notes,
      items: cart,
      total
    }),
    [cart, form, total, user?.email, user?.id]
  );

  const handleFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();

    const validation = await validateCheckout(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await saveCustomerProfile({
        fullName: form.name,
        phone: form.phone,
        address: form.address
      });

      await createOrder(payload);
      clearCart();
      navigate("/order-success");
    } catch (error) {
      setErrors({ form: error.message || "Could not place your order." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-state">
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <Link to="/order">Go to Order</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <Link to="/cart">← Back to Cart</Link>
      </div>
      <p className="profile-session">
        Ordering as <strong>{isAuthenticated ? (user?.email || user?.fullName) : (isGuest ? "Guest" : "Anonymous")}</strong>
      </p>

      <div className="checkout-layout">
        <form className="checkout-card" onSubmit={submit}>
          <h3>Customer Details</h3>

          <label>Name</label>
          <input value={form.name} onChange={(e) => handleFieldChange("name", e.target.value)} />
          {errors.name ? <p className="field-error">{errors.name}</p> : null}

          <label>Phone</label>
          <input value={form.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} />
          {errors.phone ? <p className="field-error">{errors.phone}</p> : null}

          <label>Order Type</label>
          <select value={form.orderType} onChange={(e) => handleFieldChange("orderType", e.target.value)}>
            <option value="Dine-in">Dine-in</option>
            <option value="Pickup">Pickup</option>
            <option value="Takeout">Takeout</option>
            <option value="Delivery">Delivery</option>
          </select>

          {form.orderType === "Delivery" ? (
            <>
              <label>Delivery Address</label>
              <input value={form.address} onChange={(e) => handleFieldChange("address", e.target.value)} />
              {errors.address ? <p className="field-error">{errors.address}</p> : null}
            </>
          ) : null}

          <label>Payment</label>
          <select value={form.payment} onChange={(e) => handleFieldChange("payment", e.target.value)}>
            <option value="Cash">Cash</option>
            <option value="Maya">Maya</option>
            <option value="GCash">GCash</option>
          </select>

          {(form.payment === "GCash" || form.payment === "Maya") && (
            <>
              <label>Receipt Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFieldChange("receiptName", e.target.files?.[0]?.name || "")}
              />
              {errors.receipt ? <p className="field-error">{errors.receipt}</p> : null}
            </>
          )}

          <label>Notes (optional)</label>
          <textarea value={form.notes} onChange={(e) => handleFieldChange("notes", e.target.value)} />

          {errors.form ? <p className="field-error">{errors.form}</p> : null}
          {errors.items ? <p className="field-error">{errors.items}</p> : null}

          <button className="checkout-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Placing order..." : "Place Order"}
          </button>
        </form>

        <div className="checkout-card">
          <h3>Order Summary</h3>
          {cart.map((item) => (
            <div className="summary-row" key={item.id}>
              <span>{item.name} × {item.qty}</span>
              <span>₱{(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <hr />
          <div className="summary-row total-row">
            <span>Total</span>
            <span>₱{Number(total || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
