import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useOrderTracking } from "../hooks/useOrderTracking";
import "./TrackOrder.css";

function formatTimestamp(value) {
  if (!value) return "Waiting for update";
  return new Date(value).toLocaleString();
}

export default function TrackOrder() {
  const { order, isLoading, error, steps, currentStepIndex, loadLatest, lookupByOrderId } = useOrderTracking();
  const [searchParams] = useSearchParams();
  const [searchId, setSearchId] = useState(searchParams.get("orderId") || "");

  useEffect(() => {
    const requestedOrderId = searchParams.get("orderId");
    if (requestedOrderId) {
      lookupByOrderId(requestedOrderId);
      return;
    }

    loadLatest();
  }, [loadLatest, lookupByOrderId, searchParams]);

  const activeTimeline = useMemo(() => {
    const timelineMap = new Map((order?.statusTimeline || []).map((entry) => [entry.status, entry.at]));
    return steps.map((step) => ({ step, at: timelineMap.get(step) || null }));
  }, [order?.statusTimeline, steps]);

  const handleLookup = async (event) => {
    event.preventDefault();
    if (!searchId.trim()) return;
    await lookupByOrderId(searchId);
  };

  return (
    <div className="track-page">
      <div className="track-header">
        <h1>Track Your Order</h1>
        <p>Use your order ID for a direct lookup, or load your latest order.</p>
      </div>

      <form className="track-lookup" onSubmit={handleLookup}>
        <input
          type="text"
          value={searchId}
          onChange={(event) => setSearchId(event.target.value)}
          placeholder="Enter order ID (e.g., HT-171...)"
          aria-label="Order ID"
        />
        <button type="submit" disabled={isLoading}>Find Order</button>
        <button type="button" disabled={isLoading} onClick={loadLatest}>Refresh Latest</button>
      </form>

      {isLoading ? <div className="track-state">Loading order details...</div> : null}
      {!isLoading && error ? <div className="track-state track-error">{error}</div> : null}

      {!isLoading && !error && !order ? (
        <div className="track-state">
          <h2>No Active Order Found</h2>
          <p>Place an order first, or enter an order ID above.</p>
          <Link to="/order">Go to Menu</Link>
        </div>
      ) : null}

      {!isLoading && order ? (
        <>
          <div className="track-order-card">
            <div className="track-order-row">
              <h2>{order.status}</h2>
              <span className="track-pill">{order.orderType}</span>
            </div>
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Placed:</strong> {formatTimestamp(order.createdAt)}</p>
            <p><strong>Payment:</strong> {order.payment}</p>
            <p><strong>Total:</strong> ₱{Number(order.total || 0).toFixed(2)}</p>
            <p><strong>Items:</strong> {order.items?.map((item) => `${item.name} × ${item.qty}`).join(", ")}</p>
          </div>

          <div className="track-timeline">
            {activeTimeline.map(({ step, at }, index) => (
              <div className="timeline-row" key={step}>
                <div className={`timeline-dot ${index <= currentStepIndex ? "active" : ""}`}>
                  {index < currentStepIndex ? "✓" : ""}
                </div>
                <div>
                  <p className={index <= currentStepIndex ? "active" : ""}>{step}</p>
                  <small>{formatTimestamp(at)}</small>
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
