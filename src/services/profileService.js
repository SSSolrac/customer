import { supabase } from "../lib/supabase";
import { getSession } from "./authService";

function asDbError(error, fallback = "Database request failed.") {
  if (!error) return new Error(fallback);
  const message = typeof error?.message === "string" && error.message.trim() ? error.message : fallback;
  const err = new Error(message);
  err.code = error?.code;
  err.details = error?.details;
  err.hint = error?.hint;
  return err;
}

function mapProfileRow(row) {
  if (!row) return null;

  return {
    id: String(row.id),
    customerCode: row.customer_code ?? null,
    name: row.name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    addresses: Array.isArray(row.addresses) ? row.addresses : [],
    preferences: row.preferences && typeof row.preferences === "object" ? row.preferences : {},
    isActive: row.is_active ?? true,
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

async function getUserOrNull() {
  const session = await getSession();
  return session?.user || null;
}

async function ensureProfileRow(user) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (error) throw asDbError(error, "Unable to load your profile.");
  if (data) return data;

  const displayName = user?.user_metadata?.name || user?.user_metadata?.full_name || "";

  const { data: created, error: createError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      role: "customer",
      name: displayName,
      email: user.email || "",
    })
    .select("*")
    .single();

  if (createError) {
    const message =
      "Your profile row is missing. Configure a DB trigger to auto-create `public.profiles` on signup, or allow authenticated users to insert their own profile row via RLS.";
    throw asDbError(createError, message);
  }

  return created;
}

export async function getCustomerProfile() {
  const user = await getUserOrNull();
  if (!user) return null;

  const row = await ensureProfileRow(user);
  return mapProfileRow(row);
}

export async function saveCustomerProfile(profile) {
  const user = await getUserOrNull();
  if (!user) throw new Error("You must be signed in to update your profile.");

  const payload = {
    name: String(profile?.name || "").trim(),
    email: String(profile?.email || user.email || "").trim(),
    phone: String(profile?.phone || "").trim(),
    addresses: Array.isArray(profile?.addresses) ? profile.addresses : [],
    preferences: profile?.preferences && typeof profile.preferences === "object" ? profile.preferences : {},
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("profiles").update(payload).eq("id", user.id).select("*").single();

  if (error) throw asDbError(error, "Unable to save your profile.");
  return mapProfileRow(data);
}
