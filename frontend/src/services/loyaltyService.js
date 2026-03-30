import { ApiError, requestJson } from "./api";
import { getSessionCustomerId } from "./sessionService";

export async function getCustomerLoyaltyData(customerName = "") {
  const customerId = getSessionCustomerId();

  try {
    const response = await requestJson(`/loyalty/${encodeURIComponent(customerId)}`);
    const loyalty = response?.loyalty;

    if (!loyalty) {
      throw new Error("Loyalty account not found.");
    }

    return {
      customerName,
      totalStamps: 10,
      currentStampCount: loyalty.currentStampCount || 0,
      totalStampsEarned: loyalty.totalStampsEarned || 0,
      rewardMilestones: [
        { stamp: 6, reward: "Free Latte" },
        { stamp: 10, reward: "Free Groom" }
      ],
      rewardsUnlocked: loyalty.rewardsUnlocked || [],
      lastStampedOrderId: loyalty.lastStampedOrderId || null,
      updatedAt: loyalty.updatedAt || null,
      recentActivity: []
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.data?.error || "Unable to load loyalty rewards right now.");
    }
    throw new Error("Unable to load loyalty rewards right now.");
  }
}
