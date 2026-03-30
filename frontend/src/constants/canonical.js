export const CANONICAL_ORDER_STATUSES = ["pending", "preparing", "ready", "out_for_delivery", "completed", "delivered", "cancelled", "refunded"];
export const CANONICAL_PAYMENT_METHODS = ["cash", "e_wallet"];
export const CANONICAL_PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];
export const CANONICAL_ORDER_TYPES = ["dine_in", "pickup", "takeout", "delivery"];

export const STATUS_LABELS = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded"
};

export const PAYMENT_METHOD_LABELS = {
  cash: "Cash",
  e_wallet: "E-Wallet"
};

export const ORDER_TYPE_LABELS = {
  dine_in: "Dine-in",
  pickup: "Pickup",
  takeout: "Takeout",
  delivery: "Delivery"
};

export function canonicalStatusToLabel(status) {
  return STATUS_LABELS[String(status || "").toLowerCase()] || "Pending";
}

export function canonicalPaymentMethodToLabel(method) {
  return PAYMENT_METHOD_LABELS[String(method || "").toLowerCase()] || "Cash";
}

export function canonicalOrderTypeToLabel(type) {
  return ORDER_TYPE_LABELS[String(type || "").toLowerCase()] || "Takeout";
}

export function labelToCanonicalPaymentMethod(value) {
  const key = String(value || "").trim().toLowerCase();
  if (["maya", "gcash", "e-wallet", "e_wallet"].includes(key)) return "e_wallet";
  return "cash";
}

export function labelToCanonicalOrderType(value) {
  const key = String(value || "").trim().toLowerCase();
  if (["dine-in", "dine_in", "dinein"].includes(key)) return "dine_in";
  if (key === "pickup") return "pickup";
  if (key === "delivery") return "delivery";
  return "takeout";
}
