import { ApiError, isApiAvailableError, requestJson } from "./api";
import { getScopedStorageKey, getSessionCustomerId } from "./sessionService";

const ORDER_STORE_KEY = "happyTailsOrders_v2";
const LATEST_ORDER_KEY = "happyTailsLatestOrder_v2";

const STATUS_STEPS_BY_TYPE = {
  Delivery: ["Pending", "Preparing", "Out for Delivery", "Delivered"],
  "Dine-in": ["Pending", "Preparing", "Food is Ready", "Completed"],
  Pickup: ["Pending", "Preparing", "Ready for Pickup", "Picked Up"],
  Takeout: ["Pending", "Preparing", "Ready for Takeout", "Picked Up"]
};

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

function cacheOrder(order, customerId = order?.customerId || getSessionCustomerId()) {
  const orders = readOrders(customerId).filter((item) => item.id !== order.id);
  orders.unshift(order);
  writeOrders(orders, customerId);

  const { latestKey } = getCustomerScopedKeys(customerId);
  localStorage.setItem(latestKey, order.id);
}

function makeOrderId() {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `HT-${suffix}`;
}

function shouldFallbackToLocal(error) {
  return isApiAvailableError(error) || (error instanceof ApiError && error.status >= 500);
}

function toMs(value) {
  return new Date(value).getTime() || 0;
}

function withTimeline(order) {
  if (!order) return null;

  const customerId = order.customerId || getSessionCustomerId();
  const createdAt = order.createdAt || order.updatedAt || new Date().toISOString();
  const steps = getStatusSteps(order.orderType);
  const currentIndex = Math.max(steps.findIndex((step) => step.toLowerCase() === order.status?.toLowerCase()), 0);

  const existingTimeline = Array.isArray(order.statusTimeline) ? order.statusTimeline : [];
  const timelineByStatus = new Map(existingTimeline.map((entry) => [entry.status, entry.at]));

  let pointer = toMs(createdAt);
  const fallbackTimeline = steps.slice(0, currentIndex + 1).map((step, index) => {
    const proposed = timelineByStatus.get(step);
    if (proposed) {
      pointer = Math.max(pointer, toMs(proposed));
      return { status: step, at: new Date(pointer).toISOString() };
    }

    if (index === 0) return { status: step, at: createdAt };

    pointer += 4 * 60 * 1000;
    return { status: step, at: new Date(pointer).toISOString() };
  });

  const normalizedTimeline = [...existingTimeline, ...fallbackTimeline]
    .filter((entry) => entry?.status)
    .sort((a, b) => toMs(a.at) - toMs(b.at))
    .reduce((acc, entry) => {
      if (!acc.some((saved) => saved.status === entry.status)) {
        acc.push({ status: entry.status, at: entry.at || createdAt });
      }
      return acc;
    }, []);

  return {
    ...order,
    customerId,
    createdAt,
    updatedAt: order.updatedAt || normalizedTimeline.at(-1)?.at || createdAt,
    statusTimeline: normalizedTimeline
  };
}

function normalizeAndFilterOrders(orders, customerId = getSessionCustomerId()) {
  return orders
    .map(withTimeline)
    .filter((order) => order?.customerId === customerId)
    .sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
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

async function createLocalOrder(orderPayload) {
  const now = new Date().toISOString();
  const customerId = orderPayload.customerId || getSessionCustomerId();
  const order = withTimeline({
    id: makeOrderId(),
    customerId,
    createdAt: now,
    updatedAt: now,
    status: "Pending",
    statusTimeline: [{ status: "Pending", at: now }],
    ...orderPayload
  });

  cacheOrder(order, customerId);
  return order;
}

export async function createOrder(orderPayload) {
  const validation = await validateCheckout(orderPayload);
  if (!validation.isValid) {
    const error = new Error("Checkout validation failed.");
    error.validationErrors = validation.errors;
    throw error;
  }

  try {
    const response = await requestJson("/orders", {
      method: "POST",
      body: orderPayload
    });
    const order = withTimeline(response.order);
    cacheOrder(order, order.customerId);
    return order;
  } catch (error) {
    if (!shouldFallbackToLocal(error)) throw error;
    return createLocalOrder(orderPayload);
  }
}

export async function getLatestOrder() {
  const customerId = getSessionCustomerId();

  try {
    const response = await requestJson("/orders/latest");
    const order = withTimeline(response.order);
    if (!order || order.customerId !== customerId) return null;
    cacheOrder(order, customerId);
    return order;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    if (!shouldFallbackToLocal(error)) throw error;

    const { latestKey } = getCustomerScopedKeys(customerId);
    const latestId = localStorage.getItem(latestKey);
    if (!latestId) return null;

    const orders = readOrders(customerId).map(withTimeline);
    return orders.find((order) => order.id === latestId) || null;
  }
}

export async function getOrderById(orderId) {
  if (!orderId) return null;

  const customerId = getSessionCustomerId();

  try {
    const response = await requestJson(`/orders/${orderId}`);
    const order = withTimeline(response.order);
    if (!order || order.customerId !== customerId) return null;
    cacheOrder(order, customerId);
    return order;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    if (!shouldFallbackToLocal(error)) throw error;

    const orders = readOrders(customerId).map(withTimeline);
    return orders.find((order) => order.id === orderId) || null;
  }
}

export async function getOrderHistory() {
  const customerId = getSessionCustomerId();

  try {
    const response = await requestJson("/orders");
    if (Array.isArray(response.orders)) {
      const normalized = normalizeAndFilterOrders(response.orders, customerId);
      writeOrders(normalized, customerId);
      if (normalized[0]?.id) {
        const { latestKey } = getCustomerScopedKeys(customerId);
        localStorage.setItem(latestKey, normalized[0].id);
      }
      return normalized;
    }
    return [];
  } catch (error) {
    if (!shouldFallbackToLocal(error)) throw error;
    return readOrders(customerId).map(withTimeline);
  }
}
