const state = require("../models/state");

function getItems() { return [...state.menuItems]; }
function createItem(item) { state.menuItems.push(item); return item; }
function updateItem(id, patch) {
  const idx = state.menuItems.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  state.menuItems[idx] = { ...state.menuItems[idx], ...patch };
  return state.menuItems[idx];
}
function removeItem(id) {
  const before = state.menuItems.length;
  state.menuItems = state.menuItems.filter((m) => m.id !== id);
  return before !== state.menuItems.length;
}
function getItemById(id) { return state.menuItems.find((m) => m.id === id) || null; }

function getDailyMenus() { return [...state.dailyMenus]; }
function createDailyMenu(menu) { state.dailyMenus.push(menu); return menu; }
function updateDailyMenu(id, patch) {
  const idx = state.dailyMenus.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  state.dailyMenus[idx] = { ...state.dailyMenus[idx], ...patch };
  return state.dailyMenus[idx];
}
function getDailyMenuById(id) { return state.dailyMenus.find((m) => m.id === id) || null; }

module.exports = {
  getItems, createItem, updateItem, removeItem, getItemById,
  getDailyMenus, createDailyMenu, updateDailyMenu, getDailyMenuById
};
