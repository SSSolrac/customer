const menuRepository = require("../repositories/menuRepository");
const { makeId } = require("../utils/id");

function withInventoryStatus(item) {
  const stock = Number(item.stock || 0);
  const threshold = Number(item.lowStockThreshold || 0);
  let inventoryStatus = "in_stock";
  if (stock <= 0) inventoryStatus = "out_of_stock";
  else if (stock <= threshold) inventoryStatus = "low_stock";
  return { ...item, inventoryStatus };
}

function getMenu() {
  return menuRepository.getItems().map(withInventoryStatus);
}

function createMenuItem(payload) {
  const now = new Date().toISOString();
  const item = {
    id: makeId("menu_item"),
    categoryId: payload.categoryId || "",
    name: payload.name || "",
    description: payload.description || "",
    price: Number(payload.price || 0),
    isAvailable: payload.isAvailable ?? true,
    imageUrl: payload.imageUrl || null,
    stock: Number(payload.stock || 0),
    lowStockThreshold: Number(payload.lowStockThreshold || 0),
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
    ...(payload.stock !== undefined ? { stock: Number(payload.stock) } : {}),
    ...(payload.lowStockThreshold !== undefined ? { lowStockThreshold: Number(payload.lowStockThreshold) } : {}),
    ...(payload.discount !== undefined ? { discount: Number(payload.discount) } : {}),
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
    name: item.name || menuItem?.name || "",
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
