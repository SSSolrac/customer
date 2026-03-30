import { getOrderHistory } from "./orderService";

const COMPLETED_STATUSES = new Set(["Delivered", "Completed", "Picked Up", "Enjoy!"]);

// Centralized constants keep this service ready for backend-driven loyalty rules.
const LOYALTY_MILESTONES = [
  { stamp: 6, reward: "Free Latte" },
  { stamp: 10, reward: "Free Groom" }
];
const TOTAL_STAMPS = 10;

export async function getCustomerLoyaltyData(customerName = "") {
  const orders = await getOrderHistory();
  const completedOrders = orders.filter((order) => COMPLETED_STATUSES.has(order.status));

  // Loyalty rule: earn 1 stamp per completed order.
  const currentStampCount = Math.min(completedOrders.length, TOTAL_STAMPS);
  const unlockedRewards = LOYALTY_MILESTONES.filter(({ stamp }) => currentStampCount >= stamp).map((milestone) => milestone.reward);

  return {
    customerName,
    totalStamps: TOTAL_STAMPS,
    currentStampCount,
    rewardMilestones: LOYALTY_MILESTONES,
    rewardsUnlocked: unlockedRewards,
    totalCompletedOrders: completedOrders.length,
    // Placeholder structure for future API-provided loyalty activity feed.
    recentActivity: completedOrders.slice(0, 3).map((order) => ({
      id: order.id,
      earnedAt: order.updatedAt || order.createdAt,
      status: order.status,
      stampDelta: 1,
      type: "completed-order"
    }))
  };
}
