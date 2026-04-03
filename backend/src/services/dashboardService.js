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

function getSummary(rangeInput) {
  const range = parseRange(rangeInput);
  const orders = orderService.listOrders();
  const now = Date.now();
  const days = daysFromRange(range);
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCutoff = todayStart.getTime();

  const filtered = orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
  const todayOrders = orders.filter((o) => new Date(o.createdAt).getTime() >= todayCutoff);
  const totalSales = filtered.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const todaySales = todayOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);

  const ordersByStatus = filtered.reduce((acc, o) => {
    const key = o.status || "pending";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const itemMap = new Map();
  filtered.forEach((o) => {
    (o.items || []).forEach((i) => {
      const key = i.menuItemId || i.itemName;
      const current = itemMap.get(key) || {
        menuItemId: i.menuItemId || null,
        itemName: i.itemName || "Item",
        quantity: 0,
        revenue: 0
      };
      current.quantity += Number(i.qty || 0);
      current.revenue += Number(i.lineTotal || 0);
      itemMap.set(key, current);
    });
  });

  return {
    sales: {
      today: todaySales,
      rangeTotal: totalSales,
      averageOrderValue: filtered.length ? totalSales / filtered.length : 0
    },
    orders: {
      today: todayOrders.length,
      rangeTotal: filtered.length,
      pending: Number(ordersByStatus.pending || 0),
      preparing: Number(ordersByStatus.preparing || 0),
      ready: Number(ordersByStatus.ready || 0),
      outForDelivery: Number(ordersByStatus.out_for_delivery || ordersByStatus.outForDelivery || 0),
      completed: Number(ordersByStatus.completed || 0),
      cancelled: Number(ordersByStatus.cancelled || 0)
    },
    topItems: [...itemMap.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 10),
    recentOrders: filtered.slice(0, 10),
    alerts: []
  };
}

module.exports = { getSummary };
