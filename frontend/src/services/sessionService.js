const SESSION_STORAGE_KEY = "happyTailsSession_v2";

const DEFAULT_AUTH_NAME = "Happy Tails Customer";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function createUserIdentity({ id, email, fullName, status = "authenticated" } = {}) {
  const cleanEmail = sanitizeText(email).toLowerCase();
  const cleanName = sanitizeText(fullName);

  if (status === "guest") {
    return {
      id: "guest",
      email: "",
      fullName: cleanName || "Guest"
    };
  }

  const normalizedId = sanitizeText(id) || cleanEmail || "customer-demo";

  return {
    id: normalizedId,
    email: cleanEmail,
    fullName: cleanName || DEFAULT_AUTH_NAME
  };
}

export function getStoredSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || "null");
    if (!saved?.status) return null;
    return saved;
  } catch {
    return null;
  }
}

export function getSessionUser() {
  const session = getStoredSession();

  if (session?.status === "authenticated") {
    return createUserIdentity({ ...session.user, status: "authenticated" });
  }

  if (session?.status === "guest") {
    return createUserIdentity({ ...session.user, status: "guest" });
  }

  return null;
}

export function getSessionCustomerId() {
  return getSessionUser()?.id || "guest";
}

export function getSessionStorageKey() {
  return SESSION_STORAGE_KEY;
}

export function getScopedStorageKey(baseKey, customerId) {
  return `${baseKey}:${customerId || "guest"}`;
}
