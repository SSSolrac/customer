const state = require("../models/state");

function create(order) {
  state.orders.unshift(order);
  return order;
}

function update(orderId, patch) {
  const idx = state.orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
  if (idx < 0) return null;
  state.orders[idx] = { ...state.orders[idx], ...patch };
  return state.orders[idx];
}

function findById(orderId) {
  return state.orders.find((o) => o.id === orderId || o.orderNumber === orderId) || null;
}

function findAll() {
  return [...state.orders];
}

function findByCustomer(customerId) {
  return state.orders.filter((o) => o.customerId === customerId);
}

function addHistory(entry) {
  state.orderHistory.push(entry);
  return entry;
}

function historyByOrderId(orderId) {
  return state.orderHistory.filter((h) => h.orderId === orderId).sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));
}

module.exports = { create, update, findById, findAll, findByCustomer, addHistory, historyByOrderId };
