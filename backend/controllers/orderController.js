const orderService = require("../services/orderService");

function getCustomerId(req) {
  return req.query.customerId || req.header("x-customer-id") || "";
}

function createOrder(req, res) {
  if (!Array.isArray(req.body?.items) || req.body.items.length === 0) {
    return res.status(400).json({ error: "Order must include items." });
  }

  const order = orderService.createOrder(req.body);
  return res.status(201).json({ order });
}

function getOrders(req, res) {
  const orders = orderService.listOrders(getCustomerId(req));
  return res.json({ count: orders.length, orders });
}

function getLatestOrder(req, res) {
  const order = orderService.getLatestOrder(getCustomerId(req));
  if (!order) return res.status(404).json({ error: "No orders found." });
  return res.json({ order });
}

function getOrderById(req, res) {
  const order = orderService.getOrderById(req.params.orderId, getCustomerId(req));
  if (!order) return res.status(404).json({ error: "Order not found." });
  return res.json({ order });
}

function getOrderStatusHistory(req, res) {
  const history = orderService.getOrderHistory(req.params.orderId, getCustomerId(req));
  if (!history) return res.status(404).json({ error: "Order history not found." });
  return res.json({ orderId: req.params.orderId, history });
}

module.exports = {
  createOrder,
  getOrders,
  getLatestOrder,
  getOrderById,
  getOrderStatusHistory
};
