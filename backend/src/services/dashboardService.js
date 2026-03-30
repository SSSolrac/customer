const orderService = require("./orderService");
const profileService = require("./profileService");
const loyaltyService = require("./loyaltyService");

const emptyStatuses = {
  pending: 0,
  preparing: 0,
  ready: 0,
  out_for_delivery: 0,
  completed: 0,
  delivered: 0,
  cancelled: 0,
  refunded: 0
};

function getSummary() {
  const orders = orderService.listOrders();
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const todayOrders = orders.filter((o) => now - new Date(o.createdAt).getTime() <= dayMs);
  const weekOrders = orders.filter((o) => now - new Date(o.createdAt).getTime() <= 7 * dayMs);
  const monthOrders = orders.filter((o) => now - new Date(o.createdAt).getTime() <= 30 * dayMs);

  const sum = (arr) => arr.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const orderStatusSummary = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, { ...emptyStatuses });

  const itemMap = new Map();
  orders.forEach((o) => o.items.forEach((i) => {
    const curr = itemMap.get(i.itemName) || { itemName: i.itemName, qtySold: 0, revenue: 0 };
    curr.qtySold += i.qty;
    curr.revenue += i.lineTotal;
    itemMap.set(i.itemName, curr);
  }));

  const customers = profileService.listCustomers();
  const activeLoyaltyCustomers = customers.filter((c) => loyaltyService.getLoyaltyAccount(c.id).totalStampsEarned > 0).length;

  return {
    salesSummary: {
      todaySales: sum(todayOrders),
      weeklySales: sum(weekOrders),
      monthlySales: sum(monthOrders),
      averageOrderValue: orders.length ? sum(orders) / orders.length : 0
    },
    orderStatusSummary,
    recentOrders: orders.slice(0, 10),
    topSellingItems: [...itemMap.values()].sort((a, b) => b.qtySold - a.qtySold).slice(0, 10),
    customerSummary: {
      totalCustomers: customers.length,
      activeLoyaltyCustomers
    }
  };
}

module.exports = { getSummary };
