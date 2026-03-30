const profileRepository = require("../repositories/profileRepository");

function getProfile(customerId) {
  return profileRepository.findById(customerId);
}

function upsertProfile(customerId, payload) {
  const existing = profileRepository.findById(customerId);
  const now = new Date().toISOString();
  const profile = {
    id: customerId,
    fullName: payload.fullName || existing?.fullName || "",
    email: payload.email ?? existing?.email ?? null,
    phone: payload.phone ?? existing?.phone ?? null,
    address: payload.address ?? existing?.address ?? null,
    city: payload.city ?? existing?.city ?? null,
    notes: payload.notes ?? existing?.notes ?? null,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };

  return profileRepository.upsert(profile);
}

function listCustomers() {
  return profileRepository.findAll();
}

module.exports = { getProfile, upsertProfile, listCustomers };
