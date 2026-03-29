import { isApiAvailableError, requestJson } from "./api";
import { getScopedStorageKey, getSessionCustomerId } from "./sessionService";

const PROFILE_STORAGE_KEY = "happyTailsProfile_v3";

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

export async function getCustomerProfile() {
  const customerId = getSessionCustomerId();

  try {
    const response = await requestJson("/profile/me");
    if (response?.profile) {
      localStorage.setItem(getProfileKey(customerId), JSON.stringify(response.profile));
      return response.profile;
    }
  } catch (error) {
    if (!isApiAvailableError(error)) {
      // endpoint may not exist yet; gracefully use local profile
    }
  }

  return readLocalProfile(customerId);
}

export async function saveCustomerProfile(profile) {
  const customerId = getSessionCustomerId();

  try {
    const response = await requestJson("/profile/me", { method: "PUT", body: profile });
    if (response?.profile) {
      localStorage.setItem(getProfileKey(customerId), JSON.stringify(response.profile));
      return response.profile;
    }
  } catch (error) {
    if (!isApiAvailableError(error)) {
      // fallback for offline/demo behavior
    }
  }

  localStorage.setItem(getProfileKey(customerId), JSON.stringify(profile));
  return profile;
}
