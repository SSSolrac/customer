import { Link } from "react-router-dom";
import { useOrderTracking } from "../hooks/useOrderTracking";
import "./TrackOrder.css";

export default function TrackOrder() {
  const { order, isLoading, error, steps, currentStepIndex } = useOrderTracking();

  if (isLoading) {
    return <div className="track-state">Loading your latest order...</div>;
  }

  if (error) {
    return <div className="track-state track-error">{error}</div>;
  }

  if (!order) {
    return (
      <div className="track-state">
        <h2>No Active Order Found</h2>
        <p>You haven&apos;t placed an order yet.</p>
        <Link to="/order">Go to Menu</Link>
      </div>
    );
  }

  return (
    <div className="track-page">
      <div className="track-header">
        <h2>{order.status}</h2>
        <p>{order.orderType} Order #{order.id}</p>
      </div>

      <div className="track-timeline">
        {steps.map((step, index) => (
          <div className="timeline-row" key={step}>
            <div className={`timeline-dot ${index <= currentStepIndex ? "active" : ""}`}>
              {index < currentStepIndex ? "✓" : ""}
            </div>
            <p className={index <= currentStepIndex ? "active" : ""}>{step}</p>
          </div>
        ))}
      </div>

      <div className="track-actions">
        <Link to="/order-history">View order history</Link>
      </div>
    </div>
  );
}
