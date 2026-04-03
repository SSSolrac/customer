import { ApiError, isApiAvailableError, requestJson, unwrapData } from "./api";
import { getScopedStorageKey, getSessionCustomerId } from "./sessionService";
import {
  canonicalOrderTypeToLabel,
  canonicalPaymentMethodToLabel,
  canonicalStatusToLabel,
  labelToCanonicalOrderType,
  labelToCanonicalPaymentMethod
} from "../constants/canonical";

const ORDER_STORE_KEY = "happyTailsOrders_v3";
const LATEST_ORDER_KEY = "happyTailsLatestOrder_v3";
const CANCELLATION_WINDOW_MS = 5 * 60 * 1000;
const TERMINAL_STATUSES = new Set(["cancelled", "completed", "delivered", "refunded"]);

const STATUS_STEPS_BY_ORDER_TYPE = {
  delivery: ["pending", "preparing", "ready", "out_for_delivery", "delivered"],
  dine_in: ["pending", "preparing", "ready", "completed"],
  pickup: ["pending", "preparing", "ready", "completed"],
  takeout: ["pending", "preparing", "ready", "completed"]
};

function toCanonicalOrderType(value) {
  return labelToCanonicalOrderType(value);
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
    ? order.statusTimeline.map((entry) => ({ status: String(entry.status || "").toLowerCase(), at: entry.at || entry.changedAt }))
    : [];

  const paidAt = order.paidAt || (String(order.paymentStatus || "").toLowerCase() === "paid" ? order.updatedAt || order.createdAt : null);

  return {
    ...order,
    orderNumber: order.orderNumber || order.id,
    orderType,
    orderTypeLabel: canonicalOrderTypeToLabel(orderType),
    status,
    statusLabel: canonicalStatusToLabel(status),
    paymentMethod: labelToCanonicalPaymentMethod(order.paymentMethod || "qrph"),
    paymentMethodLabel: canonicalPaymentMethodToLabel(order.paymentMethod || "qrph"),
    paymentStatus: String(order.paymentStatus || "pending").toLowerCase(),
    paidAt,
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

function updateOrderInCache(orderId, updater, customerId = getSessionCustomerId()) {
  const orders = readOrders(customerId);
  let updatedOrder = null;
  const next = orders.map((item) => {
    if (item.id !== orderId && item.orderNumber !== orderId) return item;
    updatedOrder = updater(item);
    return updatedOrder;
  });

  if (updatedOrder) {
    writeOrders(next, customerId);
    if (updatedOrder.id) {
      const { latestKey } = getCustomerScopedKeys(customerId);
      localStorage.setItem(latestKey, updatedOrder.id);
    }
  }

  return updatedOrder;
}

export function getStatusSteps(orderType) {
  return STATUS_STEPS_BY_ORDER_TYPE[toCanonicalOrderType(orderType)] || STATUS_STEPS_BY_ORDER_TYPE.takeout;
}

export function getStatusLabel(status) {
  return canonicalStatusToLabel(status);
}

export function formatRemainingCancellationTime(remainingSeconds) {
  const safeSeconds = Math.max(0, Number(remainingSeconds || 0));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function getOrderCancellationState(order, now = Date.now()) {
  if (!order) return { canCancel: false, reason: "Order not found." };

  const status = String(order.status || "").toLowerCase();
  if (status === "cancelled") return { canCancel: false, reason: "Order is already cancelled." };
  if (TERMINAL_STATUSES.has(status)) return { canCancel: false, reason: `Order is already ${getStatusLabel(status).toLowerCase()}.` };

  const paymentStatus = String(order.paymentStatus || "").toLowerCase();
  if (paymentStatus !== "paid") return { canCancel: false, reason: "Order can be cancelled only after payment is confirmed." };

  const paidAtMs = toMs(order.paidAt || order.updatedAt || order.createdAt);
  if (!paidAtMs) return { canCancel: false, reason: "Payment timestamp unavailable." };

  const expiresAtMs = paidAtMs + CANCELLATION_WINDOW_MS;
  const remainingMs = expiresAtMs - now;

  if (remainingMs <= 0) {
    return {
      canCancel: false,
      expiresAt: new Date(expiresAtMs).toISOString(),
      remainingSeconds: 0,
      reason: "Cancellation window expired."
    };
  }

  return {
    canCancel: true,
    expiresAt: new Date(expiresAtMs).toISOString(),
    remainingSeconds: Math.ceil(remainingMs / 1000)
  };
}

export async function validateCheckout(orderPayload) {
  const errors = {};

  if (!orderPayload.items?.length) errors.items = "Your cart is empty.";
  if (!orderPayload.customer?.name?.trim()) errors.name = "Name is required.";
  if (!orderPayload.customer?.phone?.trim()) errors.phone = "Phone number is required.";
  if (!orderPayload.customer?.address?.trim()) {
    errors.address = "Delivery address is required before payment.";
  }

  const paymentMethod = labelToCanonicalPaymentMethod(orderPayload.paymentMethod || orderPayload.payment);
  if (!["qrph", "gcash", "maribank", "bdo"].includes(paymentMethod)) {
    errors.paymentMethod = "Select a valid payment method.";
  }

  if (!String(orderPayload.receiptName || orderPayload.receiptImageUrl || "").trim()) {
    errors.receipt = "Receipt upload is required.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

function toCanonicalCreatePayload(orderPayload) {
  const paidAt = new Date().toISOString();

  return {
    customerId: orderPayload.customerId || getSessionCustomerId(),
    customerName: orderPayload.customer?.name || "",
    customerEmail: orderPayload.customer?.email || "",
    customerPhone: orderPayload.customer?.phone || "",
    customerAddress: orderPayload.customer?.address || "",
    orderType: toCanonicalOrderType(orderPayload.orderType),
    paymentMethod: labelToCanonicalPaymentMethod(orderPayload.paymentMethod || orderPayload.payment || "qrph"),
    paymentStatus: "paid",
    paidAt,
    serviceFee: 0,
    discount: 0,
    subtotal: Number(orderPayload.total || 0),
    total: Number(orderPayload.total || 0),
    notes: orderPayload.notes || "",
    receiptName: orderPayload.receiptName || "",
    receiptImageUrl: orderPayload.receiptImageUrl || "",
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

  const canonicalPayload = toCanonicalCreatePayload(orderPayload);
  const response = await requestJson("/orders", {
    method: "POST",
    body: canonicalPayload
  });
  const data = unwrapData(response, {});
  const order = normalizeOrder({ ...data, paidAt: data?.paidAt || canonicalPayload.paidAt, paymentStatus: "paid" });
  cacheOrder(order, order.customerId);
  return order;
}

export async function cancelOrder(order, note = "Cancelled by customer within allowed window") {
  const customerId = getSessionCustomerId();
  const existingOrder = typeof order === "string" ? await getOrderById(order) : order;
  if (!existingOrder) throw new Error("Order not found.");

  const cancellationState = getOrderCancellationState(existingOrder);
  if (!cancellationState.canCancel) {
    throw new Error(cancellationState.reason || "Cancellation is no longer allowed.");
  }

  const response = await requestJson(`/orders/${encodeURIComponent(existingOrder.id)}/status${getOrderQuery(customerId)}`, {
    method: "PATCH",
    body: { status: "cancelled", note }
  });

  const updatedOrder = normalizeOrder(unwrapData(response, null));
  cacheOrder(updatedOrder, customerId);
  return updatedOrder;
}

export async function getLatestOrder() {
  const customerId = getSessionCustomerId();

  try {
    const history = await getOrderHistory();
    const latest = history[0] || null;
    if (!latest) return null;
    cacheOrder(latest, customerId);
    return latest;
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
    const order = normalizeOrder(unwrapData(response, null));
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
    const orders = unwrapData(response, []);
    const normalized = Array.isArray(orders) ? orders.map(normalizeOrder).sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt)) : [];
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
  const history = unwrapData(response, []);
  return Array.isArray(history) ? history.map((entry) => ({ ...entry, status: String(entry.status || "").toLowerCase() })) : [];
}

export function syncCachedOrderPaidAt(orderId, paidAt) {
  if (!orderId || !paidAt) return null;
  return updateOrderInCache(orderId, (item) => ({ ...item, paidAt, paymentStatus: "paid" }));
}
