/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  buildAnonymousSession,
  getOrCreateDeviceId,
  getStoredSession,
  normalizeEmail,
  SESSION_STORAGE_KEY
} from "../services/sessionIdentity";

const SessionContext = createContext(null);

function getInitialSession() {
  getOrCreateDeviceId();
  return getStoredSession();
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(getInitialSession);
  const deviceId = useMemo(() => getOrCreateDeviceId(), []);

  const persistSession = useCallback((nextSession) => {
    setSession(nextSession);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
  }, []);

  const signIn = useCallback(({ email, fullName }) => {
    const normalizedEmail = normalizeEmail(email);
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
