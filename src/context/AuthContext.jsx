/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getSession, login, logout, onAuthStateChange, signup } from "../services/authService";
import { getCustomerProfile } from "../services/profileService";
import { clearAllSessionData } from "../services/sessionService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      setIsLoading(true);
      setAuthError("");
      try {
        const restored = await getSession();
        if (!cancelled) setSession(restored);
      } catch (error) {
        if (!cancelled) setAuthError(error?.message || "Unable to restore session.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    restore();

    const subscription = onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe?.();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) {
      setProfile(null);
      return null;
    }

    const next = await getCustomerProfile();
    setProfile(next);
    return next;
  }, [session?.user]);

  useEffect(() => {
    let cancelled = false;
    const userId = session?.user?.id || "";

    const loadProfile = async () => {
      if (!userId) {
        setProfile(null);
        return;
      }

      try {
        const next = await getCustomerProfile();
        if (!cancelled) setProfile(next);
      } catch {
        if (!cancelled) setProfile(null);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const isAuthenticated = Boolean(session?.user);

  const user = useMemo(() => {
    if (!session?.user) return null;

    const authUser = session.user;
    const fallbackName = authUser.user_metadata?.name || authUser.user_metadata?.full_name || "";
    const name = profile?.name || fallbackName || "";

    return {
      id: authUser.id,
      email: authUser.email || "",
      name,
      role: "customer",
      customerCode: profile?.customerCode ?? null,
    };
  }, [profile, session?.user]);

  const signIn = useCallback(async ({ email, password }) => {
    setAuthError("");
    await login({ email, password });
  }, []);

  const signUp = useCallback(async ({ name, email, password }) => {
    setAuthError("");
    await signup({ name, email, password });
  }, []);

  const signOut = useCallback(async () => {
    setAuthError("");
    try {
      await logout();
    } finally {
      clearAllSessionData();
      setProfile(null);
      setSession(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      isAuthenticated,
      canAccessAccount: isAuthenticated,
      isLoading,
      error: authError,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [authError, isAuthenticated, isLoading, profile, refreshProfile, session, signIn, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
