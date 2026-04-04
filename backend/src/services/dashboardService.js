const orderService = require("./orderService");
const importService = require("./importService");
const inventoryService = require("./inventoryService");

function parseRange(range) {
  if (["today", "7d", "30d", "90d", "3m", "6m", "1y", "all"].includes(range)) return range;
  return "today";
}

function daysFromRange(range) {
  if (range === "7d") return 7;
  if (range === "30d") return 30;
  if (range === "90d" || range === "3m") return 90;
  if (range === "6m") return 183;
  if (range === "1y") return 365;
  if (range === "all") return null;
  return 1;
}

function importedSalesAsOrders() {
  return importService.listImportedSales().map((entry) => ({
    id: entry.id,
    orderNumber: entry.orderNumber,
    createdAt: entry.createdAt,
    total: Number(entry.total || 0),
    status: entry.status || "completed",
    items: [{
      menuItemId: entry.itemCode || null,
      itemName: entry.itemName || "Imported Item",
      qty: 1,
      lineTotal: Number(entry.total || 0)
    }]
  }));
}

function getSummary(rangeInput) {
  const range = parseRange(rangeInput);
  const orders = [...orderService.listOrders(), ...importedSalesAsOrders()];
  const now = Date.now();
  const days = daysFromRange(range);
  const cutoff = days === null ? 0 : now - days * 24 * 60 * 60 * 1000;
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
    range,
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
    alerts: inventoryService.ingredientStockAlerts().filter((entry) => entry.status !== "in_stock")
  };
}

module.exports = { getSummary };
