const orderService = require("./orderService");

function parseRange(range) {
  if (["today", "7d", "30d", "90d"].includes(range)) return range;
  return "today";
}

function daysFromRange(range) {
  if (range === "7d") return 7;
  if (range === "30d") return 30;
  if (range === "90d") return 90;
  return 1;
}

function isInDays(order, days) {
  return Date.now() - new Date(order.createdAt).getTime() <= days * 24 * 60 * 60 * 1000;
}

function getSummary(rangeInput) {
  const range = parseRange(rangeInput);
  const allOrders = orderService.listOrders();
  const todayOrders = allOrders.filter((o) => isInDays(o, 1));
  const rangeOrders = allOrders.filter((o) => isInDays(o, daysFromRange(range)));

  const sumTotal = (orders) => orders.reduce((acc, o) => acc + Number(o.total || 0), 0);

  const topMap = new Map();
  rangeOrders.forEach((o) => {
    (o.items || []).forEach((i) => {
      const key = i.menuItemId || i.itemName;
      const row = topMap.get(key) || { itemName: i.itemName || "Item", quantity: 0, revenue: 0 };
      row.quantity += Number(i.qty || 0);
      row.revenue += Number(i.lineTotal || 0);
      topMap.set(key, row);
    });
  });

  const countStatus = (status) => rangeOrders.filter((o) => o.status === status).length;

  return {
    sales: {
      today: sumTotal(todayOrders),
      rangeTotal: sumTotal(rangeOrders),
      averageOrderValue: rangeOrders.length ? sumTotal(rangeOrders) / rangeOrders.length : 0
    },
    orders: {
      today: todayOrders.length,
      rangeTotal: rangeOrders.length,
      pending: countStatus("pending"),
      preparing: countStatus("preparing"),
      ready: countStatus("ready"),
      outForDelivery: countStatus("out_for_delivery"),
      completed: countStatus("completed") + countStatus("delivered"),
      cancelled: countStatus("cancelled") + countStatus("refunded")
    },
    topItems: [...topMap.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 10),
    recentOrders: rangeOrders.slice(0, 10),
    alerts: []
  };
}

module.exports = { getSummary };
