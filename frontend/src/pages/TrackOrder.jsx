import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useOrderTracking } from "../hooks/useOrderTracking";
import "./TrackOrder.css";

const STATUS_HELPERS = {
  Pending: "Order received and queued.",
  Preparing: "Our team is preparing your order.",
  "Out for Delivery": "Your rider is on the way.",
  Delivered: "Delivered successfully.",
  "Food is Ready": "Please proceed to the counter.",
  Completed: "Order completed. Thank you!",
  "Ready for Pickup": "You can now pick up your order.",
  "Ready for Takeout": "Pack is ready for takeout.",
  "Picked Up": "Order has been picked up."
};

const FINAL_STATUSES = new Set(["Delivered", "Completed", "Picked Up", "Enjoy!"]);

function formatTimestamp(value) {
  if (!value) return "Waiting for update";
  return new Date(value).toLocaleString();
}

export default function TrackOrder() {
  const { order, isLoading, error, steps, currentStepIndex, loadLatest, lookupByOrderId } = useOrderTracking();
  const [searchParams] = useSearchParams();
  const [searchId, setSearchId] = useState(searchParams.get("orderId") || "");
  const [lastRefreshedAt, setLastRefreshedAt] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    const requestedOrderId = searchParams.get("orderId") || searchId.trim();

    if (requestedOrderId) {
      await lookupByOrderId(requestedOrderId);
    } else {
      await loadLatest();
    }

    setLastRefreshedAt(new Date().toISOString());
    setIsRefreshing(false);
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!order || FINAL_STATUSES.has(order.status)) return;

    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, order?.status]);

  const activeTimeline = useMemo(() => {
    const timelineMap = new Map((order?.statusTimeline || []).map((entry) => [entry.status, entry.at]));
    return steps.map((step) => ({ step, at: timelineMap.get(step) || null }));
  }, [order?.statusTimeline, steps]);

  const handleLookup = async (event) => {
    event.preventDefault();
    if (!searchId.trim()) return;
    await refreshData();
  };

  return (
    <div className="track-page">
      <div className="track-header">
        <h1>Track Your Order</h1>
        <p>Use your order ID for direct lookup, or track your latest order below.</p>
      </div>

      <form className="track-lookup" onSubmit={handleLookup}>
        <input
          type="text"
          value={searchId}
          onChange={(event) => setSearchId(event.target.value)}
          placeholder="Enter order ID (e.g., HT-171...)"
          aria-label="Order ID"
        />
        <button type="submit" disabled={isLoading || isRefreshing}>Find Order</button>
        <button type="button" disabled={isLoading || isRefreshing} onClick={refreshData}>
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </form>

      {lastRefreshedAt ? <p className="track-meta">Last refreshed: {formatTimestamp(lastRefreshedAt)}</p> : null}

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
            <p><strong>Estimated completion:</strong> {order.estimatedCompletionAt ? formatTimestamp(order.estimatedCompletionAt) : "Awaiting estimate"}</p>
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
                  <small>{STATUS_HELPERS[step] || "Status update"}</small>
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
