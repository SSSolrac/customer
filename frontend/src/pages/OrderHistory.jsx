import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrderHistory } from "../services/orderService";
import "./OrderHistory.css";

function formatMoney(value) {
  return `₱${Number(value || 0).toFixed(2)}`;
}

function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      setError("");
      try {
        const result = await getOrderHistory();
        setOrders(result);
      } catch {
        setError("Unable to load your order history right now. Please try again shortly.");
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (isLoading) return <div className="history-state">Loading order history...</div>;
  if (error) return <div className="history-state history-error">{error}</div>;

  if (!orders.length) {
    return (
      <div className="history-state">
        <h2>No orders yet</h2>
        <p>Once you place your first order, your order timeline and receipts will appear here.</p>
        <Link to="/order">Start an order</Link>
      </div>
    );
  }

  return (
    <div className="history-page">
      <h1>Order History</h1>
      <p className="history-subtitle">Your recent paid and in-progress orders are listed below.</p>
      <div className="history-list">
        {orders.map((order) => {
          const isExpanded = expandedId === order.id;
          return (
            <article key={order.id} className="history-card">
              <div className="history-row">
                <h3>{order.id}</h3>
                <span className="status-pill">{order.status}</span>
              </div>

              <p>{formatDateTime(order.createdAt)}</p>
              <p>
                {order.orderType} • {order.payment} • {order.items.length} items • <strong>{formatMoney(order.total)}</strong>
              </p>

              <p className="history-items-summary">
                {order.items.slice(0, 2).map((item) => `${item.name} × ${item.qty}`).join(", ")}
                {order.items.length > 2 ? ` +${order.items.length - 2} more` : ""}
              </p>

              <div className="history-actions">
                <button type="button" aria-expanded={isExpanded} onClick={() => setExpandedId(isExpanded ? "" : order.id)}>
                  {isExpanded ? "Hide details" : "View details"}
                </button>
                <button type="button" className="ghost-btn" title="Coming soon">
                  Repeat order
                </button>
                <Link to={`/track-order?orderId=${encodeURIComponent(order.id)}`}>Track</Link>
              </div>

              {isExpanded ? (
                <ul>
                  {order.items.map((item) => (
                    <li key={item.id}>{item.name} × {item.qty} — {formatMoney(item.price * item.qty)}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
