const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const ORDER_STATUS_STEPS = {
  Delivery: ["Pending", "Preparing", "Out for Delivery", "Delivered"],
  "Dine-in": ["Pending", "Preparing", "Food is Ready", "Completed"],
  Pickup: ["Pending", "Preparing", "Ready for Pickup", "Picked Up"],
  Takeout: ["Pending", "Preparing", "Ready for Takeout", "Picked Up"]
};

const orders = [];

function getStatusSteps(orderType) {
  return ORDER_STATUS_STEPS[orderType] || ["Pending", "Preparing", "Completed"];
}

function enrichOrderWithLiveStatus(order) {
  const steps = getStatusSteps(order.orderType);
  const progressWindowMs = 15 * 60 * 1000;
  const elapsedMs = Math.max(0, Date.now() - new Date(order.createdAt).getTime());
  const maxIndex = Math.min(steps.length - 1, Math.floor(elapsedMs / progressWindowMs));

  const statusTimeline = steps.slice(0, maxIndex + 1).map((status, index) => ({
    status,
    at: new Date(new Date(order.createdAt).getTime() + index * progressWindowMs).toISOString()
  }));

  return {
    ...order,
    status: steps[maxIndex],
    statusTimeline,
    updatedAt: statusTimeline[statusTimeline.length - 1]?.at || order.createdAt
  };
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running 🚀" });
});

app.post("/api/orders", (req, res) => {
  const order = req.body;

  if (!order?.items?.length) {
    return res.status(400).json({ error: "Order must include items." });
  }

  const orderId = `HT-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const saved = {
    ...order,
    id: orderId,
    createdAt,
    updatedAt: createdAt,
    status: "Pending",
    statusTimeline: [{ status: "Pending", at: createdAt }]
  };

  orders.unshift(saved);

  res.status(201).json({ success: true, order: enrichOrderWithLiveStatus(saved) });
});

app.get("/api/orders", (req, res) => {
  const hydratedOrders = orders.map(enrichOrderWithLiveStatus);
  res.json({ count: hydratedOrders.length, orders: hydratedOrders });
});

app.get("/api/orders/latest", (req, res) => {
  if (!orders.length) {
    return res.status(404).json({ error: "No orders found." });
  }

  res.json({ order: enrichOrderWithLiveStatus(orders[0]) });
});

app.get("/api/orders/:orderId", (req, res) => {
  const order = orders.find((entry) => entry.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }

  res.json({ order: enrichOrderWithLiveStatus(order) });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
