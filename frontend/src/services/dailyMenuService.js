import { MENU } from "../data/menuData";

function deriveDailyPicks() {
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

export async function getCurrentDailyMenu() {
  const categories = deriveDailyPicks();

  return {
    title: "Menu of the Day",
    subtitle: categories.length ? "Fresh picks selected by our kitchen" : "Chef picks are being prepared",
    date: new Date().toISOString().split("T")[0],
    isActive: categories.length > 0,
    categories
  };
}
