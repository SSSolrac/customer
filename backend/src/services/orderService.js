const orderRepository = require("../repositories/orderRepository");
const { mapCreateOrderPayload } = require("../mappers/orderMapper");
const { makeId } = require("../utils/id");
const { storeReceiptDataUrl } = require("../utils/receiptStorage");

function appendHistory(orderId, status, { note = null, changedByUserId = null } = {}) {
  const historyEntry = {
    id: makeId("order_status_history"),
    orderId,
    status,
    note,
    changedByUserId,
    changedAt: new Date().toISOString()
  };
  orderRepository.addHistory(historyEntry);
  return historyEntry;
}

function withHistory(order) {
  if (!order) return null;
  return { ...order, statusTimeline: orderRepository.historyByOrderId(order.id) };
}

function createOrder(payload) {
  const canonicalOrder = mapCreateOrderPayload(payload);

  const receiptDataUrl = payload?.receiptImageUrl;
  const isDataUrl = typeof receiptDataUrl === "string" && receiptDataUrl.startsWith("data:");
  if (isDataUrl) {
    const storedReceiptUrl = storeReceiptDataUrl(receiptDataUrl, { orderId: canonicalOrder.id });
    if (!storedReceiptUrl) {
      const error = new Error("Unable to store receipt image.");
      error.status = 400;
      throw error;
    }
    canonicalOrder.receiptImageUrl = storedReceiptUrl;
  }

  orderRepository.create(canonicalOrder);
  appendHistory(canonicalOrder.id, canonicalOrder.status, { note: "Order created" });
  return withHistory(canonicalOrder);
}

function listOrders(customerId) {
  const base = customerId ? orderRepository.findByCustomer(customerId) : orderRepository.findAll();
  return base.map(withHistory);
}

function getOrder(orderId, customerId) {
  const order = orderRepository.findById(orderId);
  if (!order) return null;
  if (customerId && order.customerId !== customerId) return null;
  return withHistory(order);
}

function updateOrderStatus(orderId, patch, customerId) {
  const order = getOrder(orderId, customerId);
  if (!order) return null;
  const updated = orderRepository.update(order.id, { status: patch.status, updatedAt: new Date().toISOString() });
  appendHistory(order.id, patch.status, { note: patch.note, changedByUserId: patch.changedByUserId });
  return withHistory(updated);
}

function updateOrderPayment(orderId, patch, customerId) {
  const order = getOrder(orderId, customerId);
  if (!order) return null;
  const updated = orderRepository.update(order.id, {
    paymentStatus: patch.paymentStatus,
    updatedAt: new Date().toISOString()
  });
  return withHistory(updated);
}

function getOrderHistory(orderId, customerId) {
  const order = getOrder(orderId, customerId);
  if (!order) return null;
  return orderRepository.historyByOrderId(order.id);
}

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
  updateOrderPayment,
  getOrderHistory
};
