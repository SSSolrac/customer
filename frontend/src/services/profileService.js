const PROFILE_STORAGE_KEY = "happyTailsProfile_v1";

export async function getCustomerProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export async function saveCustomerProfile(profile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  return profile;
}
