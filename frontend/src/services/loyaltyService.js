import { requestJson } from "./api";
import { getSessionCustomerId } from "./sessionService";

const LOYALTY_MILESTONES = [
  { stamp: 6, reward: "Free Latte" },
  { stamp: 10, reward: "Free Groom" }
];
const TOTAL_STAMPS = 10;

export async function getCustomerLoyaltyData(customerName = "") {
  const customerId = getSessionCustomerId();
  const response = await requestJson(`/loyalty/${encodeURIComponent(customerId)}`);
  const loyalty = response?.loyalty || {};

  return {
    customerId,
    customerName,
    totalStamps: TOTAL_STAMPS,
    rewardMilestones: LOYALTY_MILESTONES,
    currentStampCount: Number(loyalty.currentStampCount || 0),
    totalStampsEarned: Number(loyalty.totalStampsEarned || 0),
    rewardsUnlocked: Array.isArray(loyalty.rewardsUnlocked) ? loyalty.rewardsUnlocked : [],
    lastStampedOrderId: loyalty.lastStampedOrderId || null,
    updatedAt: loyalty.updatedAt || null,
    recentActivity: []
  };
}
