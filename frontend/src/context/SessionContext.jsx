/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createUserIdentity, getSessionStorageKey, getStoredSession } from "../services/sessionService";

const SESSION_STORAGE_KEY = getSessionStorageKey();

const SessionContext = createContext(null);

function getInitialSession() {
  const saved = getStoredSession();

  if (saved?.status === "authenticated") {
    return {
      status: "authenticated",
      user: createUserIdentity({ ...saved.user, status: "authenticated" }),
      lastLoginAt: saved.lastLoginAt || new Date().toISOString(),
      lastActiveAt: saved.lastActiveAt || new Date().toISOString()
    };
  }

  if (saved?.status === "guest") {
    return {
      status: "guest",
      user: createUserIdentity({ ...saved.user, status: "guest" }),
      lastLoginAt: saved.lastLoginAt || new Date().toISOString(),
      lastActiveAt: saved.lastActiveAt || new Date().toISOString()
    };
  }

  return {
    status: "anonymous",
    user: null,
    lastLoginAt: null,
    lastActiveAt: null
  };
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(getInitialSession);

  const persistSession = useCallback((nextSession) => {
    const enhanced = {
      ...nextSession,
      lastActiveAt: new Date().toISOString()
    };

    setSession(enhanced);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(enhanced));
  }, []);

  const signIn = useCallback(({ email, fullName }) => {
    const now = new Date().toISOString();
    persistSession({
      status: "authenticated",
      user: createUserIdentity({ email, fullName, status: "authenticated" }),
      lastLoginAt: now,
      lastActiveAt: now
    });
  }, [persistSession]);

  const continueAsGuest = useCallback(() => {
    const now = new Date().toISOString();
    persistSession({
      status: "guest",
      user: createUserIdentity({ status: "guest" }),
      lastLoginAt: now,
      lastActiveAt: now
    });
  }, [persistSession]);

  const signOut = useCallback(() => {
    setSession({ status: "anonymous", user: null, lastLoginAt: null, lastActiveAt: null });
    localStorage.removeItem(SESSION_STORAGE_KEY);
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
