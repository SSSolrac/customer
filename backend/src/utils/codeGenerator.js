const state = require("../models/state");

function nextCode(counterName, prefix) {
  const current = Number(state.counters[counterName] || 0) + 1;
  state.counters[counterName] = current;
  return `${prefix}-${String(current).padStart(5, "0")}`;
}

function ensureCounterAtLeast(counterName, value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric) || numeric <= 0) return;
  if (numeric > Number(state.counters[counterName] || 0)) {
    state.counters[counterName] = numeric;
  }
}

module.exports = { nextCode, ensureCounterAtLeast };
