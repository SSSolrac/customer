const state = require("../models/state");

function create(user) {
  state.users.push(user);
  return user;
}

function findByEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return null;
  return state.users.find((user) => String(user.email || "").trim().toLowerCase() === normalized) || null;
}

function findById(id) {
  const target = String(id || "").trim();
  if (!target) return null;
  return state.users.find((user) => user.id === target) || null;
}

function findAll() {
  return [...state.users];
}

module.exports = { create, findByEmail, findById, findAll };

