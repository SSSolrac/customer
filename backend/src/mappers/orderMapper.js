const { makeId } = require("../utils/id");
const { normalizeStatus, normalizePaymentMethod, normalizePaymentStatus, normalizeOrderType } = require("../utils/normalizers");

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function toCanonicalOrderItem(item, orderId) {
  const qty = Math.max(1, num(item.qty || item.quantity || 1));
  const unitPrice = num(item.unitPrice ?? item.price ?? item.amount);
  return {
    id: item.id || makeId("order_item"),
    orderId,
    menuItemId: item.menuItemId || item.menuId || item.id || null,
    menuItemCode: item.menuItemCode || item.itemCode || null,
    itemName: item.itemName || item.name || item.title || "Item",
    qty,
    unitPrice,
    lineTotal: qty * unitPrice
  };
}

function mapCreateOrderPayload(payload) {
  const id = makeId("order");
  const orderNumber = `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const createdAt = new Date().toISOString();

  const orderType = normalizeOrderType(payload.orderType) || "takeout";
  const status = normalizeStatus(payload.status) || "pending";
  const paymentMethod = normalizePaymentMethod(payload.paymentMethod || payload.payment) || "qrph";
  const paymentStatus = normalizePaymentStatus(payload.paymentStatus) || "pending";

  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  const items = rawItems.map((item) => toCanonicalOrderItem(item, id));
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const serviceFee = num(payload.serviceFee);
  const discount = num(payload.discount);
  const total = num(payload.total) || subtotal + serviceFee - discount;

  return {
    id,
    orderNumber,
    customerId: payload.customerId || payload.customer?.id || null,
    customerName: payload.customerName || payload.customer?.name || "Guest",
    customerEmail: payload.customerEmail || payload.customer?.email || null,
    customerPhone: payload.customerPhone || payload.customer?.phone || null,
    customerAddress: payload.customerAddress || payload.customer?.address || null,
    orderType,
    status,
    paymentMethod,
    paymentStatus,
    subtotal,
    serviceFee,
    discount,
    total,
    notes: payload.notes || null,
    receiptImageUrl: payload.receiptImageUrl || payload.receiptName || null,
    createdAt,
    updatedAt: createdAt,
    items,
    statusTimeline: []
  };
}

module.exports = { mapCreateOrderPayload };
