import { requestJson, unwrapData } from "./api";
import { MENU } from "../data/menuData";

function deriveDailyPicksFallback() {
  const allItems = Object.values(MENU).flatMap((category) => category.items);
  const daySeed = new Date().getDate();
  const picks = allItems.filter((_, index) => (index + daySeed) % 5 === 0).slice(0, 6);

  const grouped = picks.reduce((acc, item) => {
    const category = Object.values(MENU).find((menuCategory) => menuCategory.items.some((entry) => entry.id === item.id));
    const categoryName = category?.title || "Featured";
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(item.name);
    return acc;
  }, {});

  return Object.entries(grouped).map(([name, items]) => ({ name, items }));
}

function normalizeDailyMenu(raw) {
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const grouped = items.reduce((acc, item) => {
    const groupName = item.categoryId || "Featured";
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(item.displayName || `${item.code || ""} ${item.name || ""}`.trim());
    return acc;
  }, {});

  return {
    title: "Menu of the Day",
    subtitle: raw?.isPublished ? "Fresh picks selected by our kitchen" : "Chef picks are being prepared",
    date: raw?.menuDate || new Date().toISOString().split("T")[0],
    isActive: Boolean(raw?.isPublished),
    categories: Object.entries(grouped).map(([name, groupItems]) => ({ name, items: groupItems }))
  };
}

export async function getCurrentDailyMenu() {
  try {
    const response = await requestJson("/menu/daily");
    return normalizeDailyMenu(unwrapData(response, null) || response);
  } catch {
    const categories = deriveDailyPicksFallback();
    return {
      title: "Menu of the Day",
      subtitle: categories.length ? "Fresh picks selected by our kitchen" : "Chef picks are being prepared",
      date: new Date().toISOString().split("T")[0],
      isActive: categories.length > 0,
      categories
    };
  }
}

export async function getMenuCatalog() {
  const response = await requestJson("/menu");
  const items = unwrapData(response, []);
  return Array.isArray(items) ? items : [];
}
