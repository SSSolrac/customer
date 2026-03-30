const menuService = require("../services/menuService");

function getMenu(req, res) {
  return res.json({ items: menuService.listMenu() });
}

function getDailyMenu(req, res) {
  return res.json(menuService.getDailyMenu());
}

module.exports = {
  getMenu,
  getDailyMenu
};
