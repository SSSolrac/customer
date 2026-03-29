import { getOrderHistory } from "./orderService";

const COMPLETED_STATUSES = new Set(["Delivered", "Completed", "Picked Up", "Enjoy!"]);
const COFFEE_PATTERN = /coffee|latte|frappe|americano|matcha|choco/i;

export async function getCustomerLoyaltyData(customerName = "") {
  const orders = await getOrderHistory();
  const completedOrders = orders.filter((order) => COMPLETED_STATUSES.has(order.status));

  const eligibleOrders = completedOrders.filter((order) =>
    COFFEE_PATTERN.test(order.items?.map((item) => item.name).join(" "))
  );

  const stampsRequired = 8;
  const totalEligibleOrders = eligibleOrders.length;
  const rewardsRedeemable = Math.floor(totalEligibleOrders / stampsRequired);
  const stampCount = totalEligibleOrders % stampsRequired;

  return {
    customerName,
    stampCount,
    stampsRequired,
    rewardAvailable: rewardsRedeemable > 0,
    rewardsRedeemable,
    totalEligibleOrders,
    completedOrdersCount: completedOrders.length,
    progressMessage: `${stampCount} of ${stampsRequired} coffee stamps in your current reward cycle.`,
    recentActivity: eligibleOrders.slice(0, 3).map((order) => ({
      id: order.id,
      earnedAt: order.updatedAt || order.createdAt,
      points: 1,
      status: order.status
    }))
  };
}
