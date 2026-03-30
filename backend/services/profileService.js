const { profiles } = require("../models/store");

function getProfile(customerId = "guest") {
  return profiles.get(customerId) || null;
}

function upsertProfile(customerId = "guest", payload = {}) {
  const existing = getProfile(customerId) || {};
  const profile = {
    customerId,
    fullName: payload.fullName || existing.fullName || "",
    phone: payload.phone || existing.phone || "",
    email: payload.email || existing.email || "",
    address: payload.address || existing.address || "",
    city: payload.city || existing.city || "",
    notes: payload.notes || existing.notes || "",
    updatedAt: new Date().toISOString()
  };

  profiles.set(customerId, profile);
  return profile;
}

module.exports = {
  getProfile,
  upsertProfile
};
