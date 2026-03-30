import { requestJson } from "./api";
import { getSessionCustomerId } from "./sessionService";
import { getOrderHistory } from "./orderService";

const LOYALTY_MILESTONES = [
  { stamp: 6, reward: "Free Latte" },
  { stamp: 10, reward: "Free Groom" }
];

export async function getCustomerLoyaltyData(customerName = "") {
  const customerId = getSessionCustomerId();

  try {
    const response = await requestJson(`/loyalty/${encodeURIComponent(customerId)}`);
    const loyalty = response?.loyalty;
    if (loyalty) {
      return {
        customerName,
        totalStamps: loyalty.totalStamps || 10,
        currentStampCount: loyalty.currentStampCount || 0,
        totalStampsEarned: loyalty.totalStampsEarned || 0,
        rewardMilestones: loyalty.rewardMilestones || LOYALTY_MILESTONES,
        rewardsUnlocked: loyalty.rewardsUnlocked || [],
        recentActivity: loyalty.recentActivity || []
      };
    }
  } catch {
    // Fallback for offline/demo mode.
  }

  const orders = await getOrderHistory();
  const completedOrders = orders.filter((order) => ["completed", "delivered"].includes(order.status));
  const totalStampsEarned = completedOrders.length;

  return {
    customerName,
    totalStamps: 10,
    currentStampCount: Math.min(totalStampsEarned, 10),
    totalStampsEarned,
    rewardMilestones: LOYALTY_MILESTONES,
    rewardsUnlocked: LOYALTY_MILESTONES.filter(({ stamp }) => totalStampsEarned >= stamp).map(({ reward }) => reward),
    recentActivity: completedOrders.slice(0, 3).map((order) => ({
      id: order.id,
      earnedAt: order.updatedAt || order.createdAt,
      status: order.status,
      stampDelta: 1,
      type: "completed-order"
    }))
  };
}
