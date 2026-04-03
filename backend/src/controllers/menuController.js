const menuService = require("../services/menuService");

function getMenu(req, res) {
  return res.json({ data: menuService.getMenu() });
}

function postMenu(req, res) {
  return res.status(201).json({ data: menuService.createMenuItem(req.body || {}) });
}

function putMenu(req, res) {
  const item = menuService.updateMenuItem(req.params.id, req.body || {});
  if (!item) return res.status(404).json({ error: "Menu item not found." });
  return res.json({ data: item });
}

function deleteMenu(req, res) {
  const ok = menuService.deleteMenuItem(req.params.id);
  if (!ok) return res.status(404).json({ error: "Menu item not found." });
  return res.status(204).send();
}

function getDaily(req, res) {
  return res.json({ data: menuService.getDailyMenu() });
}

function putDaily(req, res) {
  return res.json({ data: menuService.upsertDailyMenu(req.body || {}) });
}

function publishDaily(req, res) {
  return res.json({ data: menuService.setDailyPublished(true) });
}

function unpublishDaily(req, res) {
  return res.json({ data: menuService.setDailyPublished(false) });
}

function clearDaily(req, res) {
  return res.json({ data: menuService.clearDailyMenu() });
}

module.exports = {
  getMenu,
  postMenu,
  putMenu,
  deleteMenu,
  getDaily,
  putDaily,
  publishDaily,
  unpublishDaily,
  clearDaily
};
