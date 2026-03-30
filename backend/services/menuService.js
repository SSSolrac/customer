const { getMenuItems } = require("../models/menuModel");

function listMenu() {
  return getMenuItems();
}

function getDailyMenu() {
  const allItems = getMenuItems();
  const daySeed = new Date().getDate();
  const picks = allItems.filter((_, index) => (index + daySeed) % 2 === 0).slice(0, 4);

  return {
    title: "Menu of the Day",
    subtitle: picks.length ? "Fresh picks selected by our kitchen" : "Chef picks are being prepared",
    date: new Date().toISOString().split("T")[0],
    isActive: picks.length > 0,
    categories: [
      {
        name: "Featured",
        items: picks.map((item) => item.name)
      }
    ]
  };
}

module.exports = {
  listMenu,
  getDailyMenu
};
