const orderService = require("./orderService");

const milestones = [
  { stamp: 6, reward: "Free Latte" },
  { stamp: 10, reward: "Free Groom" }
];

function getLoyaltyAccount(customerId) {
  const orders = orderService.listOrders(customerId);
  const qualifying = orders.filter((o) => ["completed", "delivered"].includes(o.status) && o.paymentStatus === "paid");
  const uniqueOrderIds = [...new Set(qualifying.map((o) => o.id))];
  const totalStampsEarned = uniqueOrderIds.length;
  const currentStampCount = totalStampsEarned;

  return {
    customerId,
    currentStampCount,
    totalStampsEarned,
    rewardsUnlocked: milestones.filter((m) => totalStampsEarned >= m.stamp).map((m) => m.reward),
    lastStampedOrderId: uniqueOrderIds.at(-1) || null,
    updatedAt: new Date().toISOString()
  };
}

module.exports = { getLoyaltyAccount };
