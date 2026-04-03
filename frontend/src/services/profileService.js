import { isApiAvailableError, requestJson, unwrapData } from "./api";
import { getScopedStorageKey, getSessionCustomerId } from "./sessionService";

const PROFILE_STORAGE_KEY = "happyTailsProfile_v4";

function getProfileKey(customerId = getSessionCustomerId()) {
  return getScopedStorageKey(PROFILE_STORAGE_KEY, customerId);
}

function defaultProfile(customerId = getSessionCustomerId()) {
  const now = new Date().toISOString();
  return {
    id: customerId,
    name: "",
    email: "",
    phone: "",
    addresses: [],
    preferences: {},
    createdAt: now,
    updatedAt: now
  };
}

function readLocalProfile(customerId = getSessionCustomerId()) {
  try {
    return JSON.parse(localStorage.getItem(getProfileKey(customerId)) || "null") || defaultProfile(customerId);
  } catch {
    return defaultProfile(customerId);
  }
}

function getQuery(customerId = getSessionCustomerId()) {
  return `?customerId=${encodeURIComponent(customerId)}`;
}

function normalizeProfile(profile, customerId = getSessionCustomerId()) {
  const safe = profile || {};
  return {
    id: safe.id || customerId,
    name: safe.name || safe.fullName || "",
    email: safe.email || "",
    phone: safe.phone || "",
    addresses: Array.isArray(safe.addresses) ? safe.addresses : (safe.address ? [safe.address] : []),
    preferences: safe.preferences && typeof safe.preferences === "object" ? safe.preferences : {},
    createdAt: safe.createdAt || new Date().toISOString(),
    updatedAt: safe.updatedAt || new Date().toISOString()
  };
}

export async function getCustomerProfile() {
  const customerId = getSessionCustomerId();

  try {
    const response = await requestJson(`/profile/me${getQuery(customerId)}`);
    const normalized = normalizeProfile(unwrapData(response, null), customerId);
    localStorage.setItem(getProfileKey(customerId), JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    if (!isApiAvailableError(error)) {
      // fallback for uninitialized server profile data
    }
  }

  return readLocalProfile(customerId);
}

export async function saveCustomerProfile(profile) {
  const customerId = getSessionCustomerId();
  const normalized = normalizeProfile(profile, customerId);

  try {
    const response = await requestJson(`/profile/me${getQuery(customerId)}`, { method: "PUT", body: normalized });
    const saved = normalizeProfile(unwrapData(response, null), customerId);
    localStorage.setItem(getProfileKey(customerId), JSON.stringify(saved));
    return saved;
  } catch (error) {
    if (!isApiAvailableError(error)) {
      // fallback for offline/demo behavior
    }
  }

  localStorage.setItem(getProfileKey(customerId), JSON.stringify(normalized));
  return normalized;
}
