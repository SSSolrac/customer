import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem("isAuthenticated") === "true";
    const savedGuest = localStorage.getItem("isGuest") === "true";
    setIsAuthenticated(savedAuth);
    setIsGuest(savedGuest);
  }, []);

  const signIn = () => {
    setIsAuthenticated(true);
    setIsGuest(false);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.removeItem("isGuest");
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setIsAuthenticated(false);
    localStorage.setItem("isGuest", "true");
    localStorage.removeItem("isAuthenticated");
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setIsGuest(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isGuest");
  };

  const value = useMemo(() => ({ isAuthenticated, isGuest, signIn, continueAsGuest, signOut }), [isAuthenticated, isGuest]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
