/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const SESSION_STORAGE_KEY = "happyTailsSession_v2";
const DEVICE_ID_KEY = "happyTailsDeviceId_v1";

const SessionContext = createContext(null);

function getOrCreateDeviceId() {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const generated = `device-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}

function buildAnonymousSession() {
  return {
    status: "anonymous",
    user: null,
    lastLoginAt: null
  };
}

function getInitialSession() {
  const deviceId = getOrCreateDeviceId();

  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || "null");
    if (saved?.status && (saved?.user || saved.status === "anonymous")) {
      return saved;
    }
  } catch {
    // ignore parsing errors and use anonymous state
  }

  return buildAnonymousSession(deviceId);
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(getInitialSession);
  const deviceId = useMemo(() => getOrCreateDeviceId(), []);

  const persistSession = useCallback((nextSession) => {
    setSession(nextSession);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
  }, []);

  const signIn = useCallback(({ email, fullName }) => {
    const normalizedEmail = (email || "customer@happytails.cafe").trim().toLowerCase();
    persistSession({
      status: "authenticated",
      user: {
        id: `user:${normalizedEmail}`,
        email: normalizedEmail,
        fullName: fullName?.trim() || "Happy Tails Customer",
        role: "customer"
      },
      lastLoginAt: new Date().toISOString()
    });
  }, [persistSession]);

  const continueAsGuest = useCallback(() => {
    persistSession({
      status: "guest",
      user: {
        id: `guest:${deviceId}`,
        fullName: "Guest",
        role: "guest"
      },
      lastLoginAt: new Date().toISOString()
    });
  }, [deviceId, persistSession]);

  const signOut = useCallback(() => {
    const anonymous = buildAnonymousSession();
    setSession(anonymous);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(anonymous));
  }, []);

  const value = useMemo(() => ({
    session,
    user: session.user,
    isAuthenticated: session.status === "authenticated",
    isGuest: session.status === "guest",
    canAccessAccount: session.status === "authenticated",
    signIn,
    continueAsGuest,
    signOut
  }), [continueAsGuest, session, signIn, signOut]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
