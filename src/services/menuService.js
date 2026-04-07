import { supabase } from "../lib/supabase";

function asNonEmptyText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function pickFirstText(...values) {
  for (const value of values) {
    const text = asNonEmptyText(value);
    if (text) return text;
  }
  return "";
}

function asDbError(error, fallback = "Database request failed.") {
  if (!error) return new Error(fallback);
  const message = typeof error?.message === "string" && error.message.trim() ? error.message : fallback;
  const err = new Error(message);
  err.code = error?.code;
  err.details = error?.details;
  err.hint = error?.hint;
  return err;
}

function mapMenuCategoryRow(row) {
  const sortOrder = row.sort_order ?? row.sortOrder ?? 0;
  const isActive = row.is_active ?? row.isActive ?? true;
  return {
    id: String(row.id),
    name: row.name ?? "",
    sortOrder: Number(sortOrder ?? 0),
    isActive,
  };
}

function mapMenuItemRow(row) {
  const categoryId = pickFirstText(
    row.category_id,
    row.categoryId,
    row.menu_category_id,
    row.menuCategoryId,
    row.category,
    row.category_name,
    row.categoryName,
    row.category_title,
    row.categoryTitle
  );

  const isAvailable =
    row.effective_is_available ??
    row.effectiveIsAvailable ??
    row.is_effectively_available ??
    row.isEffectivelyAvailable ??
    row.is_available ??
    row.isAvailable ??
    true;

  const imageUrl = row.image_url ?? row.imageUrl ?? null;
  const createdAt = row.created_at ?? row.createdAt ?? "";
  const updatedAt = row.updated_at ?? row.updatedAt ?? "";

  return {
    id: String(row.id),
    code: row.code ?? "",
    categoryId: String(categoryId ?? ""),
    name: row.name ?? "",
    description: row.description ?? null,
    price: Number(row.price ?? 0),
    discount: Number(row.discount ?? 0),
    isAvailable,
    imageUrl,
    createdAt,
    updatedAt,
  };
}

export async function getMenuCategories() {
  const { data, error } = await supabase.from("menu_categories").select("*").order("sort_order", { ascending: true });
  if (error) throw asDbError(error, "Unable to load menu categories.");
  return (Array.isArray(data) ? data : []).map(mapMenuCategoryRow).filter((row) => row.isActive !== false);
}

async function listMenuItemsFromAvailabilityView() {
  const { data, error } = await supabase
    .from("menu_item_effective_availability")
    .select("*")
    .order("code", { ascending: true });

  if (error) return { data: null, error };
  return { data: Array.isArray(data) ? data : [], error: null };
}

export async function getMenuItems() {
  const view = await listMenuItemsFromAvailabilityView();
  if (view.data) {
    const mapped = view.data.map(mapMenuItemRow);
    // If the availability view exists but returns no rows (common during setup),
    // fall back to the base table so customers still see the catalog.
    const hasCategories = mapped.some((item) => Boolean(asNonEmptyText(item.categoryId)));
    if (mapped.length && hasCategories) return mapped;
  }

  const { data, error } = await supabase.from("menu_items").select("*").order("code", { ascending: true });
  if (error) throw asDbError(error, "Unable to load menu items.");
  return (Array.isArray(data) ? data : []).map(mapMenuItemRow);
}

export async function getMenuCatalog() {
  return getMenuItems();
}
