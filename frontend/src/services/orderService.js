import { ApiError, isApiAvailableError, requestJson } from "./api";

const ORDER_STORE_KEY = "happyTailsOrders_v1";
const LATEST_ORDER_KEY = "happyTailsLatestOrder_v1";
const SESSION_STORAGE_KEY = "happyTailsSession_v2";

const STATUS_STEPS_BY_TYPE = {
  Delivery: ["Pending", "Preparing", "Out for Delivery", "Delivered"],
  "Dine-in": ["Pending", "Preparing", "Food is Ready", "Completed"],
  Pickup: ["Pending", "Preparing", "Ready for Pickup", "Picked Up"],
  Takeout: ["Pending", "Preparing", "Ready for Takeout", "Picked Up"]
};

function getCustomerId() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || "null");
    return session?.user?.id || "guest";
  } catch {
    return "guest";
  }
}

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

function cacheOrder(order) {
  const orders = readOrders().filter((item) => item.id !== order.id);
  orders.unshift(order);
  writeOrders(orders);
  localStorage.setItem(LATEST_ORDER_KEY, order.id);
}

function readCustomerOrders(customerId) {
  return readOrders().filter((order) => order.customerId === customerId);
}

function makeOrderId() {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `HT-${suffix}`;
}

function shouldFallbackToLocal(error) {
  return isApiAvailableError(error) || (error instanceof ApiError && error.status >= 500);
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
  const order = {
    id: makeOrderId(),
    customerId: orderPayload.customerId || getCustomerId(),
    createdAt: now,
    updatedAt: now,
    status: "Pending",
    statusTimeline: [{ status: "Pending", at: now }],
    ...orderPayload
  };

  cacheOrder(order);
  return order;
}

export async function createOrder(orderPayload) {
  const validation = await validateCheckout(orderPayload);
  if (!validation.isValid) {
    const error = new Error("Checkout validation failed.");
    error.validationErrors = validation.errors;
    throw error;
  }

  const payload = { ...orderPayload, customerId: orderPayload.customerId || getCustomerId() };

  try {
    const response = await requestJson("/orders", {
      method: "POST",
      body: payload
    });
    cacheOrder(response.order);
    return response.order;
  } catch (error) {
    if (!shouldFallbackToLocal(error)) throw error;
    return createLocalOrder(payload);
  }
}

export async function getLatestOrder() {
  const customerId = getCustomerId();

  try {
    const response = await requestJson(`/orders/latest?customerId=${encodeURIComponent(customerId)}`);
    cacheOrder(response.order);
    return response.order;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    if (!shouldFallbackToLocal(error)) throw error;

    const latestId = localStorage.getItem(LATEST_ORDER_KEY);
    if (!latestId) return null;

    const orders = readCustomerOrders(customerId);
    return orders.find((order) => order.id === latestId) || orders[0] || null;
  }
}

export async function getOrderById(orderId) {
  if (!orderId) return null;

  try {
    const response = await requestJson(`/orders/${orderId}`);
    cacheOrder(response.order);
    return response.order;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    if (!shouldFallbackToLocal(error)) throw error;

    const orders = readOrders();
    return orders.find((order) => order.id === orderId) || null;
  }
}

export async function getOrderHistory() {
  const customerId = getCustomerId();

  try {
    const response = await requestJson(`/orders?customerId=${encodeURIComponent(customerId)}`);
    if (Array.isArray(response.orders)) {
      const merged = [
        ...response.orders,
        ...readOrders().filter((order) => order.customerId !== customerId)
      ];
      writeOrders(merged);
      if (response.orders[0]?.id) {
        localStorage.setItem(LATEST_ORDER_KEY, response.orders[0].id);
      }
      return response.orders;
    }
    return [];
  } catch (error) {
    if (!shouldFallbackToLocal(error)) throw error;
    return readCustomerOrders(customerId);
  }
}
