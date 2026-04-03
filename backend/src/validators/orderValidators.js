const { ORDER_STATUS, PAYMENT_STATUS } = require("../utils/enums");
const { normalizeStatus, normalizePaymentMethod, normalizePaymentStatus, normalizeOrderType } = require("../utils/normalizers");

function validateCreateOrder(payload) {
  const errors = [];
  if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) errors.push("items are required");
  if (!(payload.customerName || payload.customer?.name)) errors.push("customerName is required");
  if (payload?.orderType && !normalizeOrderType(payload.orderType)) errors.push("Invalid orderType.");
  if ((payload?.paymentMethod || payload?.payment) && !normalizePaymentMethod(payload.paymentMethod || payload.payment)) errors.push("Invalid paymentMethod.");
  if (payload?.status && !normalizeStatus(payload.status)) errors.push("Invalid status.");
  if (payload?.paymentStatus && !normalizePaymentStatus(payload.paymentStatus)) errors.push("Invalid paymentStatus.");

  const receiptImageUrl = payload?.receiptImageUrl;
  if (!receiptImageUrl) {
    errors.push("receiptImageUrl is required");
  } else if (typeof receiptImageUrl !== "string") {
    errors.push("receiptImageUrl must be a string");
  } else {
    const trimmed = receiptImageUrl.trim();
    const isDataUrl = /^data:image\/(png|jpe?g|webp);base64,/.test(trimmed);
    const isStoredUrl = /^\/uploads\/receipts\/[a-z0-9._-]+$/i.test(trimmed);
    if (!isDataUrl && !isStoredUrl) errors.push("receiptImageUrl must be a png/jpg/webp receipt image.");
  }

  return errors;
}

function validateStatusPatch(payload) {
  const normalized = normalizeStatus(payload?.status);
  if (!normalized || !ORDER_STATUS.includes(normalized)) return { error: "Invalid status." };
  return { status: normalized, note: payload?.note || null, changedByUserId: payload?.changedByUserId || null };
}

function validatePaymentPatch(payload) {
  const paymentStatus = normalizePaymentStatus(payload?.paymentStatus);
  if (!paymentStatus || !PAYMENT_STATUS.includes(paymentStatus)) return { error: "Invalid paymentStatus." };
  return { paymentStatus };
}

module.exports = { validateCreateOrder, validateStatusPatch, validatePaymentPatch };
