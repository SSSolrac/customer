const loyaltyService = require("../services/loyaltyService");

function getByCustomer(req, res) {
  return res.json({ data: loyaltyService.getLoyaltyAccount(req.params.customerId) });
}

module.exports = { getByCustomer };
