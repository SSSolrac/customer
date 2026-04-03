const orderService = require("./orderService");

const milestones = [
  { stamp: 6, reward: "Free Latte" },
  { stamp: 10, reward: "Free Groom" }
];

function toRewardRow(milestone) {
  return {
    id: `reward-${milestone.stamp}`,
    label: milestone.reward,
    requiredStamps: milestone.stamp
  };
}

function getLoyaltyAccount(customerId) {
  const orders = orderService.listOrders(customerId);
  const qualifying = orders.filter((o) => ["completed", "delivered"].includes(o.status) && o.paymentStatus === "paid");
  const uniqueOrderIds = [...new Set(qualifying.map((o) => o.id))];
  const stampCount = uniqueOrderIds.length;

  return {
    customerId,
    stampCount,
    availableRewards: milestones.filter((m) => stampCount >= m.stamp).map(toRewardRow),
    redeemedRewards: [],
    updatedAt: new Date().toISOString()
  };
}

module.exports = { getLoyaltyAccount };
