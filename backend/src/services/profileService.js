const profileRepository = require("../repositories/profileRepository");

function buildDefaultProfile(customerId, existing = null) {
  const now = new Date().toISOString();

  return {
    id: customerId,
    name: existing?.name || "",
    email: existing?.email || "",
    phone: existing?.phone || "",
    addresses: Array.isArray(existing?.addresses) ? existing.addresses : [],
    preferences: existing?.preferences && typeof existing.preferences === "object" ? existing.preferences : {},
    createdAt: existing?.createdAt || now,
    updatedAt: existing?.updatedAt || now
  };
}

function getProfile(customerId) {
  const existing = profileRepository.findById(customerId);
  if (!existing) {
    const seeded = buildDefaultProfile(customerId);
    return profileRepository.upsert(seeded);
  }
  return buildDefaultProfile(customerId, existing);
}

function upsertProfile(customerId, payload) {
  const existing = profileRepository.findById(customerId);
  const current = buildDefaultProfile(customerId, existing);
  const now = new Date().toISOString();

  const profile = {
    ...current,
    name: payload.name ?? current.name,
    email: payload.email ?? current.email,
    phone: payload.phone ?? current.phone,
    addresses: Array.isArray(payload.addresses) ? payload.addresses : current.addresses,
    preferences: payload.preferences && typeof payload.preferences === "object"
      ? payload.preferences
      : current.preferences,
    updatedAt: now
  };

  return profileRepository.upsert(profile);
}

function listCustomers() {
  return profileRepository.findAll().map((profile) => buildDefaultProfile(profile.id, profile));
}

module.exports = { getProfile, upsertProfile, listCustomers };
