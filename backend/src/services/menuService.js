const menuRepository = require("../repositories/menuRepository");
const { makeId } = require("../utils/id");

function getMenu() {
  return menuRepository.getItems();
}

function createMenuItem(payload) {
  const now = new Date().toISOString();
  const item = {
    id: makeId("menu_item"),
    categoryId: payload.categoryId || null,
    name: payload.name,
    description: payload.description || null,
    price: Number(payload.price || 0),
    isAvailable: payload.isAvailable ?? true,
    imageUrl: payload.imageUrl || null,
    createdAt: now,
    updatedAt: now
  };
  return menuRepository.createItem(item);
}

function updateMenuItem(menuItemId, payload) {
  return menuRepository.updateItem(menuItemId, { ...payload, updatedAt: new Date().toISOString() });
}

function deleteMenuItem(menuItemId) {
  return menuRepository.removeItem(menuItemId);
}

function listDailyMenus() {
  return menuRepository.getDailyMenus();
}

function createDailyMenu(payload) {
  const now = new Date().toISOString();
  const menu = {
    id: makeId("daily_menu"),
    menuDate: payload.menuDate,
    isPublished: payload.isPublished ?? false,
    createdAt: now,
    updatedAt: now,
    items: (payload.items || []).map((item, index) => ({
      id: makeId("daily_menu_item"),
      dailyMenuId: "",
      menuItemId: item.menuItemId,
      isAvailable: item.isAvailable ?? true,
      sortOrder: item.sortOrder ?? index + 1
    }))
  };
  menu.items = menu.items.map((i) => ({ ...i, dailyMenuId: menu.id }));
  return menuRepository.createDailyMenu(menu);
}

function updateDailyMenu(dailyMenuId, payload) {
  const patch = { ...payload, updatedAt: new Date().toISOString() };
  if (Array.isArray(payload.items)) {
    patch.items = payload.items.map((item, index) => ({
      id: item.id || makeId("daily_menu_item"),
      dailyMenuId,
      menuItemId: item.menuItemId,
      isAvailable: item.isAvailable ?? true,
      sortOrder: item.sortOrder ?? index + 1
    }));
  }
  return menuRepository.updateDailyMenu(dailyMenuId, patch);
}

function publishDailyMenu(dailyMenuId, isPublished) {
  return menuRepository.updateDailyMenu(dailyMenuId, { isPublished, updatedAt: new Date().toISOString() });
}

module.exports = {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  listDailyMenus,
  createDailyMenu,
  updateDailyMenu,
  publishDailyMenu
};
