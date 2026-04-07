import { supabase } from "../lib/supabase";
import { getMenuCatalog as getMenuCatalogBase, getMenuCategories } from "./menuService";

function asDbError(error, fallback = "Database request failed.") {
  if (!error) return new Error(fallback);
  const message = typeof error?.message === "string" && error.message.trim() ? error.message : fallback;
  const err = new Error(message);
  err.code = error?.code;
  err.details = error?.details;
  err.hint = error?.hint;
  return err;
}

function formatDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && value.length >= 10) return value.slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function toDisplayName(item) {
  if (!item) return "Item";
  const name = item.name ? String(item.name).trim() : "";
  return name || "Item";
}

export async function getCurrentDailyMenu() {
  const today = formatDate(new Date());

  const { data: dailyMenu, error: dailyError } = await supabase
    .from("daily_menus")
    .select("*")
    .eq("menu_date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (dailyError) throw asDbError(dailyError, "Unable to load the daily menu.");

  if (!dailyMenu) {
    return {
      title: "Menu of the Day",
      subtitle: "Chef picks are being prepared",
      date: today,
      isActive: false,
      categories: [],
    };
  }

  const isPublished = Boolean(dailyMenu.is_published ?? dailyMenu.isPublished ?? dailyMenu.published ?? false);

  const { data: dailyItems, error: dailyItemsError } = await supabase
    .from("daily_menu_items")
    .select("*")
    .eq("daily_menu_id", dailyMenu.id);

  if (dailyItemsError) throw asDbError(dailyItemsError, "Unable to load daily menu items.");

  const menuItemIds = (Array.isArray(dailyItems) ? dailyItems : [])
    .map((row) => row.menu_item_id || row.menuItemId || row.item_id || row.itemId)
    .filter(Boolean);

  const catalog = await getMenuCatalogBase();
  const byId = new Map(catalog.map((item) => [String(item.id), item]));

  const linkedItems = menuItemIds.map((id) => byId.get(String(id))).filter(Boolean);

  const categories = await getMenuCategories().catch(() => []);
  const categoryById = new Map(categories.map((cat) => [String(cat.id), cat.name]));

  const grouped = linkedItems.reduce((acc, item) => {
    const categoryId = item.categoryId ? String(item.categoryId) : "";
    const groupName = categoryById.get(categoryId) || categoryId || "Featured";
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(toDisplayName(item));
    return acc;
  }, {});

  return {
    title: "Menu of the Day",
    subtitle: isPublished ? "Fresh picks selected by our kitchen" : "Chef picks are being prepared",
    date: formatDate(dailyMenu.menu_date || today),
    isActive: isPublished,
    categories: Object.entries(grouped).map(([name, items]) => ({ name, items })),
  };
}

export async function getMenuCatalog() {
  return getMenuCatalogBase();
}
