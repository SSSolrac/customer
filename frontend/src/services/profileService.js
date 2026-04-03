import { isApiAvailableError, requestJson, unwrapData } from "./api";
import { getScopedStorageKey, getSessionCustomerId } from "./sessionService";

const PROFILE_STORAGE_KEY = "happyTailsProfile_v4";

function getProfileKey(customerId = getSessionCustomerId()) {
  return getScopedStorageKey(PROFILE_STORAGE_KEY, customerId);
}

function readLocalProfile(customerId = getSessionCustomerId()) {
  try {
    return JSON.parse(localStorage.getItem(getProfileKey(customerId)) || "null");
  } catch {
    return null;
  }
}

function getQuery(customerId = getSessionCustomerId()) {
  return `?customerId=${encodeURIComponent(customerId)}`;
}

export async function getCustomerProfile() {
  const customerId = getSessionCustomerId();

  try {
    const response = await requestJson(`/profile/me${getQuery(customerId)}`);
    const profile = unwrapData(response, null);
    if (profile) {
      localStorage.setItem(getProfileKey(customerId), JSON.stringify(profile));
      return profile;
    }
  } catch (error) {
    if (!isApiAvailableError(error)) {
      // Fallback for uninitialized server profile data.
    }
  }

  return readLocalProfile(customerId);
}

export async function saveCustomerProfile(profile) {
  const customerId = getSessionCustomerId();

  try {
    const response = await requestJson(`/profile/me${getQuery(customerId)}`, { method: "PUT", body: profile });
    const profile = unwrapData(response, null);
    if (profile) {
      localStorage.setItem(getProfileKey(customerId), JSON.stringify(profile));
      return profile;
    }
  } catch (error) {
    if (!isApiAvailableError(error)) {
      // fallback for offline/demo behavior
    }
  }

  localStorage.setItem(getProfileKey(customerId), JSON.stringify(profile));
  return profile;
}
