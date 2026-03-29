/**
 * Temporary customer-facing daily menu source.
 *
 * TODO (API integration): replace this mock with a backend call, e.g.
 * GET /api/daily-menu/current
 */
export async function getCurrentDailyMenu() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: "Menu of the Day",
        subtitle: "Available today",
        date: new Date().toISOString().split("T")[0],
        isActive: true,
        categories: [
          {
            name: "Pasta",
            items: ["Creamy Carbonara", "Creamy Tuna Pesto"]
          },
          {
            name: "Sandwiches",
            items: ["Grilled Cheese Sandwich", "Toasted Cheesy Hungarian Sandwich"]
          },
          {
            name: "Snacks",
            items: ["Chicken Poppers with Rice"]
          },
          {
            name: "Rice Meals",
            items: ["Four Seasons"]
          }
        ]
      });
    }, 250);
  });
}
