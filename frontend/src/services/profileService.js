import { ApiError, isApiAvailableError, requestJson } from "./api";

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
    return null;
  } catch (error) {
    if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 404) {
      throw error;
    }
    if (!isApiAvailableError(error) && !(error instanceof ApiError)) {
      throw error;
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
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
      throw error;
    }
    if (!isApiAvailableError(error) && !(error instanceof ApiError)) {
      throw error;
    }
  }

  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  return profile;
}
