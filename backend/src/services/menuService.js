const menuRepository = require("../repositories/menuRepository");
const inventoryRepository = require("../repositories/inventoryRepository");
const { makeId } = require("../utils/id");
const { nextCode, ensureCounterAtLeast } = require("../utils/codeGenerator");

function counterFromCode(code, prefix) {
  const value = String(code || "").trim();
  if (!value.startsWith(`${prefix}-`)) return 0;
  return Number(value.split("-")[1] || 0);
}

function getIngredientAvailability(menuItemId) {
  const recipeLines = inventoryRepository.listRecipeLines().filter((line) => line.menuItemId === menuItemId);
  if (!recipeLines.length) {
    return { ingredientSufficient: true, missingIngredients: [] };
  }

  const missingIngredients = recipeLines
    .map((line) => {
      const ingredient = inventoryRepository.getIngredientById(line.ingredientId);
      const required = Number(line.quantityRequired || 0);
      const inStock = Number(ingredient?.stockOnHand || 0);
      if (!ingredient || !ingredient.isActive || inStock < required) {
        return {
          ingredientId: line.ingredientId,
          ingredientCode: ingredient?.code || null,
          ingredientName: ingredient?.name || "Unknown",
          required,
          inStock
        };
      }
      return null;
    })
    .filter(Boolean);

  return {
    ingredientSufficient: missingIngredients.length === 0,
    missingIngredients
  };
}

function withInventoryStatus(item) {
  ensureCounterAtLeast("menuItemCode", counterFromCode(item.code, "MI"));
  const ingredientAvailability = getIngredientAvailability(item.id);
  return {
    ...item,
    isAvailable: Boolean(item.manualAvailability ?? item.isAvailable ?? true) && ingredientAvailability.ingredientSufficient,
    manualAvailability: Boolean(item.manualAvailability ?? item.isAvailable ?? true),
    ingredientAvailability
  };
}

function getMenu() {
  return menuRepository.getItems().map(withInventoryStatus);
}

function createMenuItem(payload) {
  const now = new Date().toISOString();
  const item = {
    id: makeId("menu_item"),
    code: nextCode("menuItemCode", "MI"),
    categoryId: payload.categoryId || "",
    name: payload.name || "",
    description: payload.description || "",
    price: Number(payload.price || 0),
    isAvailable: payload.isAvailable ?? true,
    manualAvailability: payload.manualAvailability ?? payload.isAvailable ?? true,
    imageUrl: payload.imageUrl || null,
    discount: Number(payload.discount || 0),
    createdAt: now,
    updatedAt: now
  };
  return withInventoryStatus(menuRepository.createItem(item));
}

function updateMenuItem(menuItemId, payload) {
  const item = menuRepository.updateItem(menuItemId, {
    ...payload,
    ...(payload.price !== undefined ? { price: Number(payload.price) } : {}),
    ...(payload.discount !== undefined ? { discount: Number(payload.discount) } : {}),
    ...(payload.isAvailable !== undefined ? { manualAvailability: Boolean(payload.isAvailable), isAvailable: Boolean(payload.isAvailable) } : {}),
    updatedAt: new Date().toISOString()
  });
  return item ? withInventoryStatus(item) : null;
}

function deleteMenuItem(menuItemId) {
  return menuRepository.removeItem(menuItemId);
}

function toDailyMenuItem(item) {
  const menuItem = menuRepository.getItemById(item.menuItemId);
  return {
    id: item.id || makeId("daily_menu_item"),
    menuItemId: item.menuItemId,
    code: item.code || menuItem?.code || null,
    name: item.name || menuItem?.name || "",
    displayName: `${item.code || menuItem?.code || "MI-?????"} - ${item.name || menuItem?.name || ""}`.trim(),
    price: Number(item.price ?? menuItem?.price ?? 0),
    categoryId: item.categoryId || menuItem?.categoryId || "",
    isAvailable: item.isAvailable ?? menuItem?.isAvailable ?? true
  };
}

function emptyDailyMenu() {
  const now = new Date().toISOString();
  return {
    id: makeId("daily_menu"),
    menuDate: now.slice(0, 10),
    isPublished: false,
    createdAt: now,
    updatedAt: now,
    items: []
  };
}

function getDailyMenu() {
  const existing = menuRepository.getDailyMenus()[0];
  return existing || emptyDailyMenu();
}

function upsertDailyMenu(payload) {
  const existing = menuRepository.getDailyMenus()[0];
  const now = new Date().toISOString();
  const next = {
    id: existing?.id || makeId("daily_menu"),
    menuDate: payload.menuDate || existing?.menuDate || now.slice(0, 10),
    isPublished: payload.isPublished ?? existing?.isPublished ?? false,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    items: Array.isArray(payload.items) ? payload.items.map(toDailyMenuItem) : (existing?.items || [])
  };

  if (existing) return menuRepository.updateDailyMenu(existing.id, next);
  return menuRepository.createDailyMenu(next);
}

function setDailyPublished(isPublished) {
  const current = getDailyMenu();
  return upsertDailyMenu({ ...current, isPublished });
}

function clearDailyMenu() {
  const current = getDailyMenu();
  return upsertDailyMenu({ ...current, isPublished: false, items: [] });
}

module.exports = {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getDailyMenu,
  upsertDailyMenu,
  setDailyPublished,
  clearDailyMenu
};
