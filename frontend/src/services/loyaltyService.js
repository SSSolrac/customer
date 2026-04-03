import { requestJson, unwrapData } from "./api";
import { getSessionCustomerId } from "./sessionService";

const LOYALTY_MILESTONES = [
  { stamp: 6, reward: "Free Latte" },
  { stamp: 10, reward: "Free Groom" }
];
const TOTAL_STAMPS = 10;

export async function getCustomerLoyaltyData(customerName = "") {
  const customerId = getSessionCustomerId();
  const response = await requestJson(`/loyalty/${encodeURIComponent(customerId)}`);
  const loyalty = unwrapData(response, {}) || {};

  const stampCount = Number(loyalty.stampCount || 0);
  const availableRewards = Array.isArray(loyalty.availableRewards) ? loyalty.availableRewards : [];

  return {
    customerId,
    customerName,
    totalStamps: TOTAL_STAMPS,
    rewardMilestones: LOYALTY_MILESTONES,
    stampCount,
    availableRewards,
    redeemedRewards: Array.isArray(loyalty.redeemedRewards) ? loyalty.redeemedRewards : [],
    // Backward-safe UI aliases
    currentStampCount: stampCount,
    totalStampsEarned: stampCount,
    rewardsUnlocked: availableRewards.map((reward) => reward.label),
    updatedAt: loyalty.updatedAt || null,
    recentActivity: []
  };
}
