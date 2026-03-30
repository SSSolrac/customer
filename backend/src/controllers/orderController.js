const orderService = require("../services/orderService");
const { validateCreateOrder, validateStatusPatch, validatePaymentPatch } = require("../validators/orderValidators");

function customerIdFromReq(req) {
  return req.query.customerId || req.header("x-customer-id") || "";
}

function create(req, res) {
  const errors = validateCreateOrder(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(", ") });
  return res.status(201).json({ order: orderService.createOrder(req.body) });
}

function list(req, res) {
  res.json({ orders: orderService.listOrders(customerIdFromReq(req)) });
}

function getById(req, res) {
  const order = orderService.getOrder(req.params.orderId, customerIdFromReq(req));
  if (!order) return res.status(404).json({ error: "Order not found." });
  return res.json({ order });
}

function patchStatus(req, res) {
  const validated = validateStatusPatch(req.body);
  if (validated.error) return res.status(400).json({ error: validated.error });
  const order = orderService.updateOrderStatus(req.params.orderId, validated, customerIdFromReq(req));
  if (!order) return res.status(404).json({ error: "Order not found." });
  return res.json({ order });
}

function patchPayment(req, res) {
  const validated = validatePaymentPatch(req.body);
  if (validated.error) return res.status(400).json({ error: validated.error });
  const order = orderService.updateOrderPayment(req.params.orderId, validated, customerIdFromReq(req));
  if (!order) return res.status(404).json({ error: "Order not found." });
  return res.json({ order });
}

function history(req, res) {
  const history = orderService.getOrderHistory(req.params.orderId, customerIdFromReq(req));
  if (!history) return res.status(404).json({ error: "Order not found." });
  return res.json({ history });
}

module.exports = { create, list, getById, patchStatus, patchPayment, history };
