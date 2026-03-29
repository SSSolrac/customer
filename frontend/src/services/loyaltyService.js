/**
 * Temporary loyalty data service for customer-facing pages.
 *
 * TODO (API integration): Replace this with a real API call, e.g.
 * GET /api/loyalty/me
 */
export async function getCustomerLoyaltyData() {
  // Simulate an async request so consumers can keep the same data flow once backend is connected.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        customerName: "Jamie",
        stampCount: 5,
        stampsRequired: 8,
        rewardAvailable: false
      });
    }, 250);
  });
}
