export const SESSION_STORAGE_KEY = "happyTailsSession_v2";
export const DEVICE_ID_KEY = "happyTailsDeviceId_v1";

export function getOrCreateDeviceId() {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const generated = `device-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}

export function normalizeEmail(email) {
  return (email || "customer@happytails.cafe").trim().toLowerCase();
}

export function buildAnonymousSession() {
  return {
    status: "anonymous",
    user: null,
    lastLoginAt: null
  };
}

export function getStoredSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || "null");
    if (saved?.status && (saved?.user || saved.status === "anonymous")) {
      return saved;
    }
  } catch {
    // ignore parse failures
  }

  return buildAnonymousSession();
}

export function getActiveUserId() {
  const session = getStoredSession();
  return session?.user?.id || `guest:${getOrCreateDeviceId()}`;
}
