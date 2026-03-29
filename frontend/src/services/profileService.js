import { isApiAvailableError, requestJson } from "./api";

const PROFILE_STORAGE_KEY = "happyTailsProfile_v2";

function readLocalProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export async function getCustomerProfile() {
  try {
    const response = await requestJson("/profile/me");
    if (response?.profile) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(response.profile));
      return response.profile;
    }
  } catch (error) {
    if (!isApiAvailableError(error)) {
      // planned endpoint may not exist yet; keep fallback silent for now
    }
  }

  return readLocalProfile();
}

export async function saveCustomerProfile(profile) {
  try {
    const response = await requestJson("/profile/me", { method: "PUT", body: profile });
    if (response?.profile) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(response.profile));
      return response.profile;
    }
  } catch (error) {
    if (!isApiAvailableError(error)) {
      // fallback to local for demo/offline usage
    }
  }

  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  return profile;
}
