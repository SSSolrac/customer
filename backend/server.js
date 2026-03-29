const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const STORE_FILE = path.join(__dirname, "data", "store.json");

const ORDER_STATUS_STEPS = {
  Delivery: ["Pending", "Preparing", "Out for Delivery", "Delivered"],
  "Dine-in": ["Pending", "Preparing", "Food is Ready", "Completed"],
  Pickup: ["Pending", "Preparing", "Ready for Pickup", "Picked Up"],
  Takeout: ["Pending", "Preparing", "Ready for Takeout", "Picked Up"]
};

const DAILY_MENU_POOL = [
  { category: "Coffee", item: "Caramel Macchiato" },
  { category: "Coffee", item: "Spanish Latte" },
  { category: "Non-Caffeinated", item: "Strawberry Milk" },
  { category: "Snacks", item: "Grilled Cheese Sandwich" },
  { category: "Rice Meals", item: "Chicken Poppers with Rice" },
  { category: "Frappuccino", item: "Matcha Frappe" },
  { category: "Frappuccino", item: "Caramel Macchiato Frappe" },
  { category: "Snacks", item: "Toasted Cheesy Hungarian Sandwich" }
];

function ensureStoreFile() {
  const dir = path.dirname(STORE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({ orders: [], profilesByCustomerId: {} }, null, 2));
  }
}

function loadStore() {
  ensureStoreFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, "utf-8"));
    return {
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      profilesByCustomerId: parsed.profilesByCustomerId && typeof parsed.profilesByCustomerId === "object"
        ? parsed.profilesByCustomerId
        : {}
    };
  } catch {
    return { orders: [], profilesByCustomerId: {} };
  }
}

function saveStore() {
  fs.writeFileSync(
    STORE_FILE,
    JSON.stringify({ orders, profilesByCustomerId: Object.fromEntries(profilesByCustomerId) }, null, 2)
  );
}

const persisted = loadStore();
const orders = persisted.orders;
const profilesByCustomerId = new Map(Object.entries(persisted.profilesByCustomerId));

function getCustomerId(req) {
  return req.get("x-customer-id") || req.query.customerId || req.body?.customerId || "guest";
}

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
    updatedAt: statusTimeline[statusTimeline.length - 1]?.at || order.createdAt,
    estimatedCompletionAt:
      maxIndex < steps.length - 1
        ? new Date(new Date(order.createdAt).getTime() + (steps.length - 1) * progressWindowMs).toISOString()
        : null
  };
}

function getOrdersForCustomer(customerId) {
  return orders.filter((order) => order.customerId === customerId).map(enrichOrderWithLiveStatus);
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
  const customerId = getCustomerId(req);
  const saved = {
    ...order,
    id: orderId,
    customerId,
    createdAt,
    updatedAt: createdAt,
    status: "Pending",
    statusTimeline: [{ status: "Pending", at: createdAt }]
  };

  orders.unshift(saved);
  saveStore();

  res.status(201).json({ success: true, order: enrichOrderWithLiveStatus(saved) });
});

app.get("/api/orders", (req, res) => {
  const customerId = getCustomerId(req);
  const hydratedOrders = getOrdersForCustomer(customerId);
  res.json({ count: hydratedOrders.length, orders: hydratedOrders });
});

app.get("/api/orders/latest", (req, res) => {
  const customerId = getCustomerId(req);
  const customerOrders = getOrdersForCustomer(customerId);

  if (!customerOrders.length) {
    return res.status(404).json({ error: "No orders found." });
  }

  res.json({ order: customerOrders[0] });
});

app.get("/api/orders/:orderId", (req, res) => {
  const customerId = getCustomerId(req);
  const order = orders.find((entry) => entry.id === req.params.orderId && entry.customerId === customerId);
  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }

  res.json({ order: enrichOrderWithLiveStatus(order) });
});

app.get("/api/profile/me", (req, res) => {
  const customerId = getCustomerId(req);
  const profile = profilesByCustomerId.get(customerId) || null;
  res.json({ profile });
});

app.put("/api/profile/me", (req, res) => {
  const customerId = getCustomerId(req);
  const profile = {
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  profilesByCustomerId.set(customerId, profile);
  saveStore();
  res.json({ profile });
});

app.get("/api/loyalty/me", (req, res) => {
  const customerId = getCustomerId(req);
  const customerOrders = getOrdersForCustomer(customerId);
  const completed = customerOrders.filter((order) => ["Delivered", "Completed", "Picked Up"].includes(order.status));
  const eligibleOrders = completed.filter((order) => /coffee|latte|frappe|americano/i.test(order.items.map((item) => item.name).join(" ")));

  const stampsRequired = 8;
  const stampCount = eligibleOrders.length % stampsRequired;

  res.json({
    loyalty: {
      stampCount,
      stampsRequired,
      rewardAvailable: eligibleOrders.length > 0 && eligibleOrders.length % stampsRequired === 0,
      totalEligibleOrders: eligibleOrders.length,
      recentActivity: eligibleOrders.slice(0, 3).map((order) => ({
        id: order.id,
        earnedAt: order.updatedAt || order.createdAt,
        points: 1
      }))
    }
  });
});

app.get("/api/daily-menu/current", (req, res) => {
  const date = new Date();
  const daySeed = date.getUTCDate();
  const picks = DAILY_MENU_POOL.filter((_, index) => (index + daySeed) % 2 === 0).slice(0, 6);
  const grouped = picks.reduce((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = [];
    acc[entry.category].push(entry.item);
    return acc;
  }, {});

  const categories = Object.entries(grouped).map(([name, items]) => ({ name, items }));

  res.json({
    menu: {
      title: "Menu of the Day",
      subtitle: categories.length ? "Fresh picks selected by our kitchen" : "Chef picks are being prepared",
      date: date.toISOString().split("T")[0],
      isActive: categories.length > 0,
      categories
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
