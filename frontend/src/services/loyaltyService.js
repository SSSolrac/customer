import { requestJson } from "./api";
import { getOrderHistory } from "./orderService";

export async function getCustomerLoyaltyData(customerName = "") {
  try {
    const response = await requestJson("/loyalty/me");
    if (response?.loyalty) {
      return {
        customerName,
        ...response.loyalty
      };
    }
  } catch {
    // fallback below
  }

  const orders = await getOrderHistory();
  const completed = orders.filter((order) => ["Delivered", "Completed", "Picked Up", "Enjoy!"].includes(order.status));
  const eligibleStamps = completed.filter((order) => /coffee|latte|frappe|americano/i.test(order.items?.map((item) => item.name).join(" "))).length;
  const stampsRequired = 8;
  const stampCount = eligibleStamps % stampsRequired;

  return {
    customerName,
    stampCount,
    stampsRequired,
    rewardAvailable: eligibleStamps > 0 && eligibleStamps % stampsRequired === 0,
    totalEligibleOrders: eligibleStamps,
    recentActivity: completed.slice(0, 3).map((order) => ({
      id: order.id,
      earnedAt: order.updatedAt || order.createdAt,
      points: /coffee|latte|frappe|americano/i.test(order.items?.map((item) => item.name).join(" ")) ? 1 : 0
    }))
  };
}
