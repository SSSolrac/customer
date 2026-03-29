import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrderHistory } from "../services/orderService";
import "./OrderHistory.css";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const result = await getOrderHistory();
        setOrders(result);
      } catch {
        setError("Unable to load your order history right now.");
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
        <p>Once you place your first order, it will show up here.</p>
        <Link to="/order">Start an order</Link>
      </div>
    );
  }

  return (
    <div className="history-page">
      <h1>Order History</h1>
      <div className="history-list">
        {orders.map((order) => (
          <article key={order.id} className="history-card">
            <div className="history-row">
              <h3>{order.id}</h3>
              <span className="status-pill">{order.status}</span>
            </div>
            <p>{new Date(order.createdAt).toLocaleString()}</p>
            <p>{order.items.length} items • ₱{order.total}</p>
            <ul>
              {order.items.slice(0, 3).map((item) => (
                <li key={item.id}>{item.name} × {item.qty}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
