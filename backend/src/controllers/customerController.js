const profileService = require("../services/profileService");

function list(req, res) {
  res.json({ customers: profileService.listCustomers() });
}

function getById(req, res) {
  const profile = profileService.getProfile(req.params.customerId);
  if (!profile) return res.status(404).json({ error: "Customer not found." });
  return res.json({ customer: profile });
}

module.exports = { list, getById };
