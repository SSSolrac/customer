const menuItems = [
  { id: "hot-1", name: "Cafe Latte", category: "Hot Coffee", price: 110 },
  { id: "hot-2", name: "Spanish Latte", category: "Hot Coffee", price: 120 },
  { id: "iced-1", name: "Iced Americano", category: "Iced Coffee", price: 120 },
  { id: "iced-2", name: "Iced Vanilla Latte", category: "Iced Coffee", price: 135 },
  { id: "meal-1", name: "Chicken Poppers with Rice", category: "Rice Meals", price: 180 },
  { id: "sand-1", name: "Grilled Cheese Sandwich", category: "Sandwiches", price: 150 }
];

function getMenuItems() {
  return menuItems;
}

module.exports = {
  getMenuItems
};
