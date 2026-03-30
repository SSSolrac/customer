const { getLoyaltyByCustomerId } = require("../services/loyaltyService");

function getLoyalty(req, res) {
  const loyalty = getLoyaltyByCustomerId(req.params.customerId);
  return res.json({ loyalty });
}

module.exports = {
  getLoyalty
};
