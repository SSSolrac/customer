const state = require("../models/state");

function findById(id) {
  return state.profiles.find((p) => p.id === id) || null;
}

function upsert(profile) {
  const idx = state.profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) state.profiles[idx] = profile;
  else state.profiles.push(profile);
  return profile;
}

function findAll() {
  return [...state.profiles];
}

module.exports = { findById, upsert, findAll };
