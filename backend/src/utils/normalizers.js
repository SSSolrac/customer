const { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS, ORDER_TYPE } = require("./enums");

const STATUS_MAP = {
  pending: "pending",
  preparing: "preparing",
  "food is ready": "ready",
  "ready for pickup": "ready",
  "ready for takeout": "ready",
  ready: "ready",
  "out for delivery": "out_for_delivery",
  out_for_delivery: "out_for_delivery",
  completed: "completed",
  delivered: "delivered",
  "picked up": "completed",
  cancelled: "cancelled",
  refunded: "refunded"
};

const PAYMENT_METHOD_MAP = {
  cash: "cash",
  maya: "e_wallet",
  gcash: "e_wallet",
  "e-wallet": "e_wallet",
  e_wallet: "e_wallet"
};

const ORDER_TYPE_MAP = {
  "dine-in": "dine_in",
  dinein: "dine_in",
  dine_in: "dine_in",
  pickup: "pickup",
  takeout: "takeout",
  delivery: "delivery"
};

function clean(v) {
  return String(v || "").trim().toLowerCase();
}

function normalizeStatus(value) {
  const normalized = STATUS_MAP[clean(value)];
  return ORDER_STATUS.includes(normalized) ? normalized : null;
}

function normalizePaymentMethod(value) {
  const normalized = PAYMENT_METHOD_MAP[clean(value)];
  return PAYMENT_METHOD.includes(normalized) ? normalized : null;
}

function normalizePaymentStatus(value) {
  const normalized = clean(value);
  return PAYMENT_STATUS.includes(normalized) ? normalized : null;
}

function normalizeOrderType(value) {
  const normalized = ORDER_TYPE_MAP[clean(value)] || clean(value);
  return ORDER_TYPE.includes(normalized) ? normalized : null;
}

module.exports = {
  normalizeStatus,
  normalizePaymentMethod,
  normalizePaymentStatus,
  normalizeOrderType
};
