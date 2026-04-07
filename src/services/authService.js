import { supabase } from "../lib/supabase";

function asAuthError(error, fallback = "Authentication failed.") {
  if (!error) return new Error(fallback);
  const message = typeof error?.message === "string" && error.message.trim() ? error.message : fallback;
  const err = new Error(message);
  err.code = error?.code;
  err.status = error?.status;
  return err;
}

export async function login({ email, password } = {}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email || "").trim(),
    password: String(password || "").trim(),
  });

  if (error) throw asAuthError(error, "Invalid email or password.");
  return data?.user || null;
}

export async function signup({ name, email, password } = {}) {
  const trimmedName = String(name || "").trim();
  const { data, error } = await supabase.auth.signUp({
    email: String(email || "").trim(),
    password: String(password || "").trim(),
    options: {
      data: {
        ...(trimmedName ? { name: trimmedName, full_name: trimmedName } : {}),
      },
    },
  });

  if (error) throw asAuthError(error, "Unable to create account.");

  return {
    user: data?.user || null,
    session: data?.session || null,
    needsEmailVerification: Boolean(data?.user && !data?.session),
  };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw asAuthError(error, "Unable to sign out.");
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw asAuthError(error, "Unable to restore session.");
  return data?.session || null;
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data?.subscription || null;
}

export async function requireUser() {
  const session = await getSession();
  const user = session?.user || null;
  if (!user) throw new Error("You must be signed in to continue.");
  return user;
}
