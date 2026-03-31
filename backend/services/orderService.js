const { orders } = require("../models/store");
const { normalizeOrderType, normalizePaymentMethod, normalizeStatus } = require("../utils/normalizers");

const ORDER_FLOWS = {
  delivery: ["pending", "preparing", "ready", "out_for_delivery", "delivered"],
  dine_in: ["pending", "preparing", "ready", "completed"],
  pickup: ["pending", "preparing", "ready", "completed"],
  takeout: ["pending", "preparing", "ready", "completed"]
};

function getOrderFlow(orderType = "takeout") {
  return ORDER_FLOWS[orderType] || ORDER_FLOWS.takeout;
}

function asNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function buildOrderNumber() {
  return `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
}

function mapItemsToCanonical(items = []) {
  return items.map((item, index) => ({
    id: item.id || `line-${index + 1}`,
    itemName: item.itemName || item.name || "Item",
    qty: Math.max(1, asNumber(item.qty || item.quantity || 1)),
    unitPrice: asNumber(item.unitPrice || item.price || 0)
  }));
}

function getStatusTimeline(createdAt, orderType, currentStatus) {
  const flow = getOrderFlow(orderType);
  const nowMs = Date.now();
  const baseMs = new Date(createdAt).getTime();
  const progressWindowMs = 15 * 60 * 1000;

  let statusIndex = flow.findIndex((status) => status === normalizeStatus(currentStatus));
  if (statusIndex < 0) {
    const elapsedIndex = Math.floor((nowMs - baseMs) / progressWindowMs);
    statusIndex = Math.min(Math.max(elapsedIndex, 0), flow.length - 1);
  }

  return flow.slice(0, statusIndex + 1).map((status, index) => ({
    status,
    at: new Date(baseMs + index * progressWindowMs).toISOString()
  }));
}

function canonicalizeIncomingOrder(payload) {
  const createdAt = new Date().toISOString();
  const canonicalItems = mapItemsToCanonical(payload.items || []);
  const subtotal = canonicalItems.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
  const serviceFee = asNumber(payload.serviceFee);
  const discount = asNumber(payload.discount);
  const total = asNumber(payload.total) || Math.max(subtotal + serviceFee - discount, 0);
  const orderType = normalizeOrderType(payload.orderType);

  const canonicalOrder = {
    id: buildOrderNumber(),
    orderNumber: buildOrderNumber(),
    customerId: payload.customerId || payload.customer?.id || "guest",
    customerName: payload.customerName || payload.customer?.name || "Guest Customer",
    customerEmail: payload.customerEmail || payload.customer?.email || "",
    customerPhone: payload.customerPhone || payload.customer?.phone || "",
    customerAddress: payload.customerAddress || payload.customer?.address || "",
    orderType,
    status: normalizeStatus(payload.status || "pending"),
    paymentMethod: normalizePaymentMethod(payload.paymentMethod || payload.payment) || "qrph",
    paymentStatus: ["pending", "paid", "failed", "refunded"].includes(String(payload.paymentStatus || "").toLowerCase())
      ? String(payload.paymentStatus).toLowerCase()
      : "pending",
    subtotal,
    serviceFee,
    discount,
    total,
    notes: payload.notes || "",
    receiptImageUrl: payload.receiptImageUrl || payload.receiptName || "",
    createdAt,
    updatedAt: createdAt,
    items: canonicalItems
  };

  const statusTimeline = getStatusTimeline(canonicalOrder.createdAt, canonicalOrder.orderType, canonicalOrder.status);
  canonicalOrder.status = statusTimeline.at(-1)?.status || canonicalOrder.status;
  canonicalOrder.updatedAt = statusTimeline.at(-1)?.at || canonicalOrder.updatedAt;

  return {
    ...canonicalOrder,
    statusTimeline
  };
}

function enrichOrder(order) {
  const statusTimeline = getStatusTimeline(order.createdAt, order.orderType, order.status);
  return {
    ...order,
    status: statusTimeline.at(-1)?.status || order.status,
    updatedAt: statusTimeline.at(-1)?.at || order.updatedAt,
    statusTimeline
  };
}

function createOrder(payload) {
  const order = canonicalizeIncomingOrder(payload);
  orders.unshift(order);
  return enrichOrder(order);
}

function listOrders(customerId) {
  return orders
    .map(enrichOrder)
    .filter((order) => !customerId || order.customerId === customerId);
}

function getLatestOrder(customerId) {
  return listOrders(customerId)[0] || null;
}

function getOrderById(orderId, customerId) {
  const order = orders.find((entry) => entry.id === orderId || entry.orderNumber === orderId);
  if (!order) return null;
  if (customerId && order.customerId !== customerId) return null;
  return enrichOrder(order);
}

function getOrderHistory(orderId, customerId) {
  const order = getOrderById(orderId, customerId);
  if (!order) return null;
  return order.statusTimeline;
}

module.exports = {
  getOrderFlow,
  createOrder,
  listOrders,
  getLatestOrder,
  getOrderById,
  getOrderHistory
};
