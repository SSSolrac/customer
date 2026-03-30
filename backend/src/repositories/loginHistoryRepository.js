const state = require("../models/state");

function create(entry) {
  state.loginHistory.unshift(entry);
  return entry;
}

function findAll() {
  return [...state.loginHistory];
}

module.exports = { create, findAll };
