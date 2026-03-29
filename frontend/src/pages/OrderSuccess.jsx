import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLatestOrder } from "../services/orderService";

export default function OrderSuccess() {
  const [latestOrderId, setLatestOrderId] = useState("");

  useEffect(() => {
    const loadLatest = async () => {
      const latest = await getLatestOrder();
      if (latest?.id) setLatestOrderId(latest.id);
    };

    loadLatest();
  }, []);

  return (
    <div style={{ padding: 48, textAlign: "center", minHeight: "60vh" }}>
      <div style={{ fontSize: "5rem" }}>🎉</div>
      <h1 style={{ color: "#ff4d94" }}>Order Confirmed</h1>
      <p style={{ fontSize: "1.1rem", marginBottom: 8 }}>
        Thank you. Your order was received and sent to the café team.
      </p>
      <p style={{ marginBottom: 24, color: "#555" }}>
        {latestOrderId ? `Order reference: ${latestOrderId}` : "Your order reference will appear in Track Order shortly."}
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
        <Link
          to="/track-order"
          style={{
            padding: "12px 24px",
            backgroundColor: "#36d7e8",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "bold"
          }}
        >
          Track My Order
        </Link>

        <Link
          to="/order"
          style={{
            padding: "12px 24px",
            border: "2px solid #ff4d94",
            color: "#ff4d94",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "bold"
          }}
        >
          Order Again
        </Link>
      </div>
    </div>
  );
}
