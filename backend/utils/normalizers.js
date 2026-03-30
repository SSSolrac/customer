const ORDER_TYPE_MAP = {
  "dine-in": "dine_in",
  "dine_in": "dine_in",
  dinein: "dine_in",
  pickup: "pickup",
  takeout: "takeout",
  delivery: "delivery"
};

const STATUS_MAP = {
  pending: "pending",
  preparing: "preparing",
  "food is ready": "ready",
  "ready for pickup": "ready",
  "ready for takeout": "ready",
  "out for delivery": "out_for_delivery",
  "picked up": "completed",
  completed: "completed",
  delivered: "delivered",
  cancelled: "cancelled",
  refunded: "refunded"
};

const PAYMENT_MAP = {
  cash: "cash",
  maya: "e_wallet",
  gcash: "e_wallet",
  e_wallet: "e_wallet",
  ewallet: "e_wallet"
};

function clean(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeOrderType(orderType) {
  return ORDER_TYPE_MAP[clean(orderType)] || "takeout";
}

function normalizeStatus(status) {
  return STATUS_MAP[clean(status)] || "pending";
}

function normalizePaymentMethod(paymentMethod) {
  return PAYMENT_MAP[clean(paymentMethod)] || "cash";
}

module.exports = {
  normalizeOrderType,
  normalizeStatus,
  normalizePaymentMethod
};
