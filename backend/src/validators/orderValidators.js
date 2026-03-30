const { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS, ORDER_TYPE } = require("../utils/enums");
const { normalizeStatus, normalizePaymentMethod, normalizePaymentStatus, normalizeOrderType } = require("../utils/normalizers");

function validateCreateOrder(payload) {
  const errors = [];
  if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) errors.push("items are required");
  if (!(payload.customerName || payload.customer?.name)) errors.push("customerName is required");

  const orderTypeProvided = payload?.orderType !== undefined;
  const statusProvided = payload?.status !== undefined;
  const paymentMethodProvided = payload?.paymentMethod !== undefined || payload?.payment !== undefined;
  const paymentStatusProvided = payload?.paymentStatus !== undefined;

  if (orderTypeProvided && !ORDER_TYPE.includes(normalizeOrderType(payload.orderType))) errors.push("Invalid orderType.");
  if (statusProvided && !ORDER_STATUS.includes(normalizeStatus(payload.status))) errors.push("Invalid status.");
  if (paymentMethodProvided && !PAYMENT_METHOD.includes(normalizePaymentMethod(payload.paymentMethod || payload.payment))) errors.push("Invalid paymentMethod.");
  if (paymentStatusProvided && !PAYMENT_STATUS.includes(normalizePaymentStatus(payload.paymentStatus))) errors.push("Invalid paymentStatus.");

  return errors;
}

function validateStatusPatch(payload) {
  const normalized = normalizeStatus(payload?.status);
  if (!normalized || !ORDER_STATUS.includes(normalized)) return { error: "Invalid status." };
  return { status: normalized, note: payload?.note || null, changedByUserId: payload?.changedByUserId || null };
}

function validatePaymentPatch(payload) {
  const paymentMethod = normalizePaymentMethod(payload?.paymentMethod || payload?.payment);
  const paymentStatus = normalizePaymentStatus(payload?.paymentStatus);
  if (!paymentMethod || !PAYMENT_METHOD.includes(paymentMethod)) return { error: "Invalid paymentMethod." };
  if (paymentStatus && !PAYMENT_STATUS.includes(paymentStatus)) return { error: "Invalid paymentStatus." };
  return { paymentMethod, paymentStatus: paymentStatus || undefined };
}

module.exports = { validateCreateOrder, validateStatusPatch, validatePaymentPatch };
