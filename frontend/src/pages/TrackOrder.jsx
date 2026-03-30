import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useOrderTracking } from "../hooks/useOrderTracking";
import { getStatusLabel } from "../services/orderService";
import "./TrackOrder.css";

function formatTimestamp(value) {
  if (!value) return "Waiting for update";
  return new Date(value).toLocaleString();
}

export default function TrackOrder() {
  const { order, isLoading, error, steps, currentStepIndex, loadLatest, lookupByOrderId } = useOrderTracking();
  const [searchId, setSearchId] = useState("");

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  const activeTimeline = useMemo(() => {
    const timelineMap = new Map((order?.statusTimeline || []).map((entry) => [entry.status, entry.at]));
    return steps.map((step, index) => ({
      step,
      at: timelineMap.get(step) || null,
      state: index < currentStepIndex ? "complete" : index === currentStepIndex ? "current" : "upcoming"
    }));
  }, [order?.statusTimeline, steps, currentStepIndex]);

  const handleLookup = async (event) => {
    event.preventDefault();
    if (!searchId.trim()) return;
    await lookupByOrderId(searchId);
  };

  return (
    <div className="track-page">
      <div className="track-header">
        <h1>Track Your Order</h1>
        <p>Track by order ID, or pull your latest order on this account.</p>
      </div>

      <form className="track-lookup" onSubmit={handleLookup}>
        <input
          type="text"
          value={searchId}
          onChange={(event) => setSearchId(event.target.value.toUpperCase())}
          placeholder="Enter order ID (e.g., ORD-20260101-101)"
          aria-label="Order ID"
        />
        <button type="submit" disabled={isLoading}>Find Order</button>
        <button type="button" disabled={isLoading} onClick={loadLatest}>Refresh Latest</button>
      </form>

      {isLoading ? <div className="track-state">Checking your latest order updates...</div> : null}
      {!isLoading && error ? <div className="track-state track-error">{error}</div> : null}

      {!isLoading && !error && !order ? (
        <div className="track-state">
          <h2>No Active Order Found</h2>
          <p>Place an order first, or enter your order ID above.</p>
          <Link to="/order">Go to Menu</Link>
        </div>
      ) : null}

      {!isLoading && order ? (
        <>
          <div className="track-order-card">
            <div className="track-order-row">
              <h2>{order.statusLabel || getStatusLabel(order.status)}</h2>
              <span className="track-pill">{order.orderTypeLabel}</span>
            </div>
            <p><strong>Order ID:</strong> {order.orderNumber || order.id}</p>
            <p><strong>Placed:</strong> {formatTimestamp(order.createdAt)}</p>
            <p><strong>Last update:</strong> {formatTimestamp(order.updatedAt)}</p>
            <p><strong>Payment:</strong> {order.paymentMethodLabel}</p>
            <p><strong>Total:</strong> ₱{Number(order.total || 0).toFixed(2)}</p>
            <p><strong>Items:</strong> {order.items?.map((item) => `${item.itemName} × ${item.qty}`).join(", ")}</p>
          </div>

          <div className="track-timeline">
            {activeTimeline.map(({ step, at, state }) => (
              <div className="timeline-row" key={step}>
                <div className={`timeline-dot ${state !== "upcoming" ? "active" : ""}`}>
                  {state === "complete" ? "✓" : ""}
                </div>
                <div>
                  <p className={state !== "upcoming" ? "active" : ""}>{getStatusLabel(step)}</p>
                  <small>{at ? `Updated ${formatTimestamp(at)}` : "Awaiting this stage"}</small>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div className="track-actions">
        <Link to="/order-history">View order history</Link>
      </div>
    </div>
  );
}
