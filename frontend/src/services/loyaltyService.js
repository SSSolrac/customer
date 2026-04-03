import { requestJson, unwrapData } from "./api";
import { getSessionCustomerId } from "./sessionService";

export async function getCustomerLoyaltyData(customerName = "") {
  const customerId = getSessionCustomerId();
  const response = await requestJson(`/loyalty/${encodeURIComponent(customerId)}`);
  const loyalty = unwrapData(response, {}) || {};

  return {
    customerId,
    customerName,
    stampCount: Number(loyalty.stampCount || 0),
    availableRewards: Array.isArray(loyalty.availableRewards) ? loyalty.availableRewards : [],
    redeemedRewards: Array.isArray(loyalty.redeemedRewards) ? loyalty.redeemedRewards : [],
    updatedAt: loyalty.updatedAt || null,
    recentActivity: []
  };
}
