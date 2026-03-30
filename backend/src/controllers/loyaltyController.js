const loyaltyService = require("../services/loyaltyService");

function getByCustomer(req, res) {
  res.json({ loyalty: loyaltyService.getLoyaltyAccount(req.params.customerId) });
}

module.exports = { getByCustomer };
