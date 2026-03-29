import { createContext, useCallback, useContext, useMemo, useState } from "react";

const SESSION_STORAGE_KEY = "happyTailsSession_v2";

const SessionContext = createContext(null);

function getInitialSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || "null");
    if (saved?.status) return saved;
  } catch {
    // ignore parsing errors and use anonymous state
  }

  return {
    status: "anonymous",
    user: null,
    lastLoginAt: null
  };
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(getInitialSession);

  const persistSession = useCallback((nextSession) => {
    setSession(nextSession);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
  }, []);

  const signIn = useCallback(({ email, fullName }) => {
    persistSession({
      status: "authenticated",
      user: {
        id: email || "customer-demo",
        email: email || "customer@happytails.cafe",
        fullName: fullName || "Happy Tails Customer"
      },
      lastLoginAt: new Date().toISOString()
    });
  }, [persistSession]);

  const continueAsGuest = useCallback(() => {
    persistSession({
      status: "guest",
      user: { id: "guest", fullName: "Guest" },
      lastLoginAt: new Date().toISOString()
    });
  }, [persistSession]);

  const signOut = useCallback(() => {
    setSession({ status: "anonymous", user: null, lastLoginAt: null });
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
