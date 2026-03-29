const ORDER_STORE_KEY = "happyTailsOrders_v1";
const LATEST_ORDER_KEY = "happyTailsLatestOrder_v1";

const STATUS_STEPS_BY_TYPE = {
  Delivery: ["Pending", "Preparing", "Out for Delivery", "Delivered"],
  "Dine-in": ["Pending", "Preparing", "Food is Ready", "Enjoy!"],
  Pickup: ["Pending", "Preparing", "Ready for Pickup", "Picked Up"],
  Takeout: ["Pending", "Preparing", "Ready for Takeout", "Picked Up"]
};

function readOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDER_STORE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  localStorage.setItem(ORDER_STORE_KEY, JSON.stringify(orders));
}

function makeOrderId() {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `HT-${suffix}`;
}

export function getStatusSteps(orderType) {
  return STATUS_STEPS_BY_TYPE[orderType] || ["Pending", "Preparing", "Processing", "Completed"];
}

export async function validateCheckout(orderPayload) {
  const errors = {};

  if (!orderPayload.items?.length) {
    errors.items = "Your cart is empty.";
  }

  if (!orderPayload.customer?.name?.trim()) {
    errors.name = "Name is required.";
  }

  if (!orderPayload.customer?.phone?.trim()) {
    errors.phone = "Phone number is required.";
  }

  if (orderPayload.orderType === "Delivery" && !orderPayload.customer?.address?.trim()) {
    errors.address = "Delivery address is required for delivery orders.";
  }

  const requiresReceipt = ["GCash", "Maya"].includes(orderPayload.payment);
  if (requiresReceipt && !orderPayload.receiptName) {
    errors.receipt = "Receipt upload is required for wallet payments.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export async function createOrder(orderPayload) {
  // TODO(API): Replace with POST /api/orders.
  const validation = await validateCheckout(orderPayload);
  if (!validation.isValid) {
    const error = new Error("Checkout validation failed.");
    error.validationErrors = validation.errors;
    throw error;
  }

  const orders = readOrders();
  const now = new Date().toISOString();
  const order = {
    id: makeOrderId(),
    createdAt: now,
    status: "Pending",
    statusTimeline: [{ status: "Pending", at: now }],
    ...orderPayload
  };

  orders.unshift(order);
  writeOrders(orders);
  localStorage.setItem(LATEST_ORDER_KEY, order.id);

  return order;
}

export async function getLatestOrder() {
  // TODO(API): Replace with GET /api/orders/:id for last order.
  const latestId = localStorage.getItem(LATEST_ORDER_KEY);
  if (!latestId) return null;

  const orders = readOrders();
  return orders.find((order) => order.id === latestId) || null;
}

export async function getOrderById(orderId) {
  // TODO(API): Replace with GET /api/orders/:id.
  if (!orderId) return null;
  const orders = readOrders();
  return orders.find((order) => order.id === orderId) || null;
}

export async function getOrderHistory() {
  // TODO(API): Replace with GET /api/orders/history.
  return readOrders();
}
