const menuService = require("../services/menuService");

function getMenu(req, res) { res.json({ items: menuService.getMenu() }); }
function postMenu(req, res) { res.status(201).json({ item: menuService.createMenuItem(req.body || {}) }); }
function patchMenu(req, res) {
  const item = menuService.updateMenuItem(req.params.menuItemId, req.body || {});
  if (!item) return res.status(404).json({ error: "Menu item not found." });
  return res.json({ item });
}
function deleteMenu(req, res) {
  const ok = menuService.deleteMenuItem(req.params.menuItemId);
  if (!ok) return res.status(404).json({ error: "Menu item not found." });
  return res.status(204).send();
}

function getDaily(req, res) { res.json({ dailyMenus: menuService.listDailyMenus() }); }
function postDaily(req, res) { res.status(201).json({ dailyMenu: menuService.createDailyMenu(req.body || {}) }); }
function patchDaily(req, res) {
  const dailyMenu = menuService.updateDailyMenu(req.params.dailyMenuId, req.body || {});
  if (!dailyMenu) return res.status(404).json({ error: "Daily menu not found." });
  return res.json({ dailyMenu });
}
function publishDaily(req, res) {
  const dailyMenu = menuService.publishDailyMenu(req.params.dailyMenuId, req.body?.isPublished ?? true);
  if (!dailyMenu) return res.status(404).json({ error: "Daily menu not found." });
  return res.json({ dailyMenu });
}

module.exports = { getMenu, postMenu, patchMenu, deleteMenu, getDaily, postDaily, patchDaily, publishDaily };
