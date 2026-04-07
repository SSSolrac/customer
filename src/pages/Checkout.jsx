import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder, validateCheckout } from "../services/orderService";
import { getCustomerProfile, saveCustomerProfile } from "../services/profileService";
import { syncCustomerNotifications } from "../services/notificationService";
import { labelToCanonicalOrderType } from "../constants/canonical";
import { PAYMENT_METHOD_OPTIONS, getPaymentQrAsset, paymentMethodToLabel } from "../utils/paymentMethods";
import "./Checkout.css";

const defaultForm = {
  name: "",
  phone: "",
  address: "",
  orderType: "Dine-in",
  paymentMethod: "qrph",
  notes: ""
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read the receipt file."));
    reader.readAsDataURL(file);
  });
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) return;
      try {
        const profile = await getCustomerProfile();
        if (!profile) return;
        setForm((prev) => ({
          ...prev,
          name: profile?.name || "",
          phone: profile?.phone || "",
          address: Array.isArray(profile?.addresses) ? (profile.addresses[0] || "") : "",
        }));
      } catch {
        // best effort; user can still fill the form manually
      }
    };

    loadProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    return () => {
      if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl);
    };
  }, [receiptPreviewUrl]);

  const canonicalOrderType = labelToCanonicalOrderType(form.orderType);
  const isCashPayment = form.paymentMethod === "cash";
  const isAddressValid = Boolean(form.address.trim());

  const payload = useMemo(
    () => ({
      customerId: user?.id || "guest",
      customer: {
        name: form.name,
        phone: form.phone,
        address: form.address,
        email: user?.email || ""
      },
      orderType: labelToCanonicalOrderType(form.orderType),
      paymentMethod: form.paymentMethod,
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

  const handleReceiptChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
    if (!allowedTypes.has(file.type)) {
      setErrors((prev) => ({ ...prev, receipt: "Upload a PNG, JPG, or WebP image." }));
      event.target.value = "";
      return;
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrors((prev) => ({ ...prev, receipt: "Receipt must be 5MB or smaller." }));
      event.target.value = "";
      return;
    }

    if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl);
    setReceiptFile(file);
    setReceiptPreviewUrl(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, receipt: "" }));
  };

  const removeReceipt = () => {
    if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl);
    setReceiptPreviewUrl("");
    setReceiptFile(null);
    setErrors((prev) => ({ ...prev, receipt: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();

    const shouldRequireReceipt = !isCashPayment;

    let receiptDataUrl = "";
    if (shouldRequireReceipt) {
      if (!receiptFile) {
        setErrors((prev) => ({ ...prev, receipt: "Receipt upload is required." }));
        return;
      }

      try {
        receiptDataUrl = await fileToDataUrl(receiptFile);
      } catch (error) {
        setErrors((prev) => ({ ...prev, receipt: error.message || "Could not read the receipt file." }));
        return;
      }
    }

    const payloadWithReceipt = shouldRequireReceipt
      ? {
        ...payload,
        receiptImageUrl: receiptDataUrl,
      }
      : payload;

    const validation = await validateCheckout(payloadWithReceipt);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await saveCustomerProfile({
        name: form.name,
        phone: form.phone,
        addresses: form.address ? [form.address] : []
      });

      await createOrder(payloadWithReceipt);
      await syncCustomerNotifications();
      clearCart();
      removeReceipt();
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

  if (!isAuthenticated) {
    return (
      <div className="checkout-state">
        <h1>Checkout</h1>
        <p>Please sign in to place an order.</p>
        <Link to="/">Go back</Link>
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
        Ordering as <strong>{user?.email || form.name || "Authenticated user"}</strong>
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

          {canonicalOrderType === "delivery" ? (
            <label>Delivery Address</label>
          ) : (
            <label>Address for receipt & support</label>
          )}
          <input
            value={form.address}
            onChange={(e) => handleFieldChange("address", e.target.value)}
            placeholder="House/Unit, Street, Barangay, City"
          />
          {errors.address ? <p className="field-error">{errors.address}</p> : null}

          <label>Payment</label>
          <select value={form.paymentMethod} onChange={(e) => handleFieldChange("paymentMethod", e.target.value)}>
            {PAYMENT_METHOD_OPTIONS.map((method) => (
              <option key={method.value} value={method.value}>{method.label}</option>
            ))}
          </select>
          {errors.paymentMethod ? <p className="field-error">{errors.paymentMethod}</p> : null}

          <div className="payment-qr-preview" aria-live="polite">
            {getPaymentQrAsset(form.paymentMethod) ? (
              <>
                <p className="payment-qr-title">Scan to pay via {paymentMethodToLabel(form.paymentMethod)}</p>
                <img src={getPaymentQrAsset(form.paymentMethod)} alt={`${paymentMethodToLabel(form.paymentMethod)} QR code`} />
              </>
            ) : (
              <>
                <p className="payment-qr-title">Cash payment selected</p>
                <p className="field-hint">You can pay in cash upon pickup or delivery.</p>
              </>
            )}
          </div>

          <label>
            Upload Receipt{" "}
            {!isCashPayment ? <span className="required-indicator">*</span> : null}
          </label>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleReceiptChange} />
          <p className="field-hint">
            {!isCashPayment
              ? "Upload a screenshot/photo of your payment receipt (PNG/JPG/WebP, max 5MB)."
              : "Optional for cash payments."}
          </p>
          {receiptFile ? (
            <div className="receipt-preview" aria-live="polite">
              <img src={receiptPreviewUrl} alt="Receipt preview" />
              <div className="receipt-meta">
                <span className="receipt-file-name">{receiptFile.name}</span>
                <button type="button" className="receipt-remove" onClick={removeReceipt}>
                  Remove receipt
                </button>
              </div>
            </div>
          ) : null}
          {errors.receipt ? <p className="field-error">{errors.receipt}</p> : null}

          <label>Notes (optional)</label>
          <textarea value={form.notes} onChange={(e) => handleFieldChange("notes", e.target.value)} />

          {errors.form ? <p className="field-error">{errors.form}</p> : null}
          {errors.items ? <p className="field-error">{errors.items}</p> : null}

          {!isAddressValid ? <p className="field-error">Address is required before payment.</p> : null}
          <button className="checkout-submit" type="submit" disabled={isSubmitting || !isAddressValid}>
            {isSubmitting ? "Placing order..." : "Place Order"}
          </button>
        </form>

        <div className="checkout-card">
          <h3>Order Summary</h3>
          {cart.map((item) => (
            <div className="summary-row" key={item.id}>
              <span>{item.displayName || item.name} × {item.qty}</span>
              <span>₱{(Number(item.price || 0) * Number(item.qty || 0)).toFixed(2)}</span>
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
