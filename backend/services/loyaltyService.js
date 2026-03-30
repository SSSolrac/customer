const { listOrders } = require("./orderService");

const LOYALTY_MILESTONES = [
  { stamp: 6, reward: "Free Latte" },
  { stamp: 10, reward: "Free Groom" }
];

function getLoyaltyByCustomerId(customerId) {
  const orders = listOrders(customerId);
  const completedOrders = orders.filter((order) => ["completed", "delivered"].includes(order.status));

  const totalStampsEarned = completedOrders.length;
  const currentStampCount = Math.min(totalStampsEarned, 10);
  const rewardsUnlocked = LOYALTY_MILESTONES
    .filter((milestone) => totalStampsEarned >= milestone.stamp)
    .map((milestone) => milestone.reward);

  return {
    customerId,
    totalStamps: 10,
    totalStampsEarned,
    currentStampCount,
    rewardMilestones: LOYALTY_MILESTONES,
    rewardsUnlocked,
    recentActivity: completedOrders.slice(0, 5).map((order) => ({
      orderId: order.id,
      earnedAt: order.updatedAt,
      stampDelta: 1,
      status: order.status
    }))
  };
}

module.exports = {
  getLoyaltyByCustomerId
};
