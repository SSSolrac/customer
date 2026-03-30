import { ApiError, isApiAvailableError, requestJson } from "./api";
import { getScopedStorageKey, getSessionCustomerId } from "./sessionService";

const ORDER_STORE_KEY = "happyTailsOrders_v3";
const LATEST_ORDER_KEY = "happyTailsLatestOrder_v3";

const STATUS_LABELS = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded"
};

const STATUS_STEPS_BY_ORDER_TYPE = {
  delivery: ["pending", "preparing", "ready", "out_for_delivery", "delivered"],
  dine_in: ["pending", "preparing", "ready", "completed"],
  pickup: ["pending", "preparing", "ready", "completed"],
  takeout: ["pending", "preparing", "ready", "completed"]
};

const ORDER_TYPE_LABELS = {
  dine_in: "Dine-in",
  pickup: "Pickup",
  takeout: "Takeout",
  delivery: "Delivery"
};

function toCanonicalOrderType(value) {
  const key = String(value || "").trim().toLowerCase();
  if (["dine-in", "dine_in", "dinein"].includes(key)) return "dine_in";
  if (["pickup"].includes(key)) return "pickup";
  if (["takeout"].includes(key)) return "takeout";
  if (["delivery"].includes(key)) return "delivery";
  return "takeout";
}

function getCustomerScopedKeys(customerId = getSessionCustomerId()) {
  return {
    ordersKey: getScopedStorageKey(ORDER_STORE_KEY, customerId),
    latestKey: getScopedStorageKey(LATEST_ORDER_KEY, customerId)
  };
}

function readOrders(customerId = getSessionCustomerId()) {
  try {
    const { ordersKey } = getCustomerScopedKeys(customerId);
    return JSON.parse(localStorage.getItem(ordersKey) || "[]");
  } catch {
    return [];
  }
}

function writeOrders(orders, customerId = getSessionCustomerId()) {
  const { ordersKey } = getCustomerScopedKeys(customerId);
  localStorage.setItem(ordersKey, JSON.stringify(orders));
}

function shouldFallbackToLocal(error) {
  return isApiAvailableError(error) || (error instanceof ApiError && error.status >= 500);
}

function toMs(value) {
  return new Date(value).getTime() || 0;
}

function normalizeOrder(order) {
  if (!order) return null;

  const orderType = toCanonicalOrderType(order.orderType);
  const status = String(order.status || "pending").toLowerCase();
  const items = Array.isArray(order.items)
    ? order.items.map((item, index) => ({
      id: item.id || `line-${index + 1}`,
      itemName: item.itemName || item.name || "Item",
      qty: Number(item.qty || 1),
      unitPrice: Number(item.unitPrice || item.price || 0)
    }))
    : [];

  const timeline = Array.isArray(order.statusTimeline)
    ? order.statusTimeline.map((entry) => ({ status: String(entry.status || "").toLowerCase(), at: entry.at }))
    : [];

  return {
    ...order,
    orderNumber: order.orderNumber || order.id,
    orderType,
    orderTypeLabel: ORDER_TYPE_LABELS[orderType] || "Takeout",
    status,
    statusLabel: STATUS_LABELS[status] || "Pending",
    paymentMethod: order.paymentMethod || "cash",
    paymentMethodLabel: order.paymentMethod === "e_wallet" ? "E-Wallet" : String(order.paymentMethod || "cash").toUpperCase(),
    items,
    statusTimeline: timeline,
    total: Number(order.total || 0)
  };
}

function cacheOrder(order, customerId = order?.customerId || getSessionCustomerId()) {
  const orders = readOrders(customerId).filter((item) => item.id !== order.id);
  orders.unshift(order);
  writeOrders(orders, customerId);
  const { latestKey } = getCustomerScopedKeys(customerId);
  localStorage.setItem(latestKey, order.id);
}

function getOrderQuery(customerId = getSessionCustomerId()) {
  return `?customerId=${encodeURIComponent(customerId)}`;
}

export function getStatusSteps(orderType) {
  return STATUS_STEPS_BY_ORDER_TYPE[toCanonicalOrderType(orderType)] || STATUS_STEPS_BY_ORDER_TYPE.takeout;
}

export function getStatusLabel(status) {
  return STATUS_LABELS[String(status || "").toLowerCase()] || "Pending";
}

export async function validateCheckout(orderPayload) {
  const errors = {};

  if (!orderPayload.items?.length) errors.items = "Your cart is empty.";
  if (!orderPayload.customer?.name?.trim()) errors.name = "Name is required.";
  if (!orderPayload.customer?.phone?.trim()) errors.phone = "Phone number is required.";
  if (toCanonicalOrderType(orderPayload.orderType) === "delivery" && !orderPayload.customer?.address?.trim()) {
    errors.address = "Delivery address is required for delivery orders.";
  }

  const payment = String(orderPayload.payment || "").toLowerCase();
  if (["maya", "gcash"].includes(payment) && !orderPayload.receiptName) {
    errors.receipt = "Receipt upload is required for wallet payments.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

function toCanonicalCreatePayload(orderPayload) {
  return {
    customerId: orderPayload.customerId || getSessionCustomerId(),
    customerName: orderPayload.customer?.name || "",
    customerEmail: orderPayload.customer?.email || "",
    customerPhone: orderPayload.customer?.phone || "",
    customerAddress: orderPayload.customer?.address || "",
    orderType: toCanonicalOrderType(orderPayload.orderType),
    paymentMethod: ["maya", "gcash"].includes(String(orderPayload.payment || "").toLowerCase()) ? "e_wallet" : String(orderPayload.payment || "cash").toLowerCase(),
    paymentStatus: "pending",
    serviceFee: 0,
    discount: 0,
    subtotal: Number(orderPayload.total || 0),
    total: Number(orderPayload.total || 0),
    notes: orderPayload.notes || "",
    receiptImageUrl: orderPayload.receiptName || "",
    items: (orderPayload.items || []).map((item) => ({
      id: item.id,
      itemName: item.name,
      qty: item.qty,
      unitPrice: item.price
    }))
  };
}

export async function createOrder(orderPayload) {
  const validation = await validateCheckout(orderPayload);
  if (!validation.isValid) {
    const error = new Error("Checkout validation failed.");
    error.validationErrors = validation.errors;
    throw error;
  }

  const response = await requestJson("/orders", {
    method: "POST",
    body: toCanonicalCreatePayload(orderPayload)
  });
  const order = normalizeOrder(response.order);
  cacheOrder(order, order.customerId);
  return order;
}

export async function getLatestOrder() {
  const customerId = getSessionCustomerId();

  try {
    const response = await requestJson(`/orders/latest${getOrderQuery(customerId)}`);
    const order = normalizeOrder(response.order);
    if (!order) return null;
    cacheOrder(order, customerId);
    return order;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    if (!shouldFallbackToLocal(error)) throw error;
    const { latestKey } = getCustomerScopedKeys(customerId);
    const latestId = localStorage.getItem(latestKey);
    if (!latestId) return null;
    return readOrders(customerId).find((entry) => entry.id === latestId) || null;
  }
}

export async function getOrderById(orderId) {
  if (!orderId) return null;
  const customerId = getSessionCustomerId();

  try {
    const response = await requestJson(`/orders/${encodeURIComponent(orderId)}${getOrderQuery(customerId)}`);
    const order = normalizeOrder(response.order);
    if (!order) return null;
    cacheOrder(order, customerId);
    return order;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    if (!shouldFallbackToLocal(error)) throw error;
    return readOrders(customerId).find((entry) => entry.id === orderId || entry.orderNumber === orderId) || null;
  }
}

export async function getOrderHistory() {
  const customerId = getSessionCustomerId();

  try {
    const response = await requestJson(`/orders${getOrderQuery(customerId)}`);
    const normalized = Array.isArray(response.orders) ? response.orders.map(normalizeOrder).sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt)) : [];
    writeOrders(normalized, customerId);
    return normalized;
  } catch (error) {
    if (!shouldFallbackToLocal(error)) throw error;
    return readOrders(customerId);
  }
}

export async function getOrderStatusHistory(orderId) {
  if (!orderId) return [];
  const customerId = getSessionCustomerId();
  const response = await requestJson(`/orders/${encodeURIComponent(orderId)}/history${getOrderQuery(customerId)}`);
  return Array.isArray(response.history) ? response.history.map((entry) => ({ ...entry, status: String(entry.status || "").toLowerCase() })) : [];
}
