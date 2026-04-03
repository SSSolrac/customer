import { requestJson, unwrapData } from "./api";
import { getSessionCustomerId } from "./sessionService";

function normalizeReward(reward) {
  return {
    id: String(reward?.id || ""),
    label: String(reward?.label || ""),
    requiredStamps: Number(reward?.requiredStamps || 0)
  };
}

export async function getCustomerLoyaltyData() {
  const customerId = getSessionCustomerId();
  const response = await requestJson(`/loyalty/${encodeURIComponent(customerId)}`);
  const loyalty = unwrapData(response, {}) || {};

  return {
    customerId: String(loyalty.customerId || customerId),
    stampCount: Number(loyalty.stampCount || 0),
    availableRewards: (Array.isArray(loyalty.availableRewards) ? loyalty.availableRewards : []).map(normalizeReward),
    redeemedRewards: (Array.isArray(loyalty.redeemedRewards) ? loyalty.redeemedRewards : []).map(normalizeReward),
    updatedAt: String(loyalty.updatedAt || "")
  };
}
