const profileService = require("../services/profileService");

function list(req, res) {
  return res.json({ data: profileService.listCustomers() });
}

function getById(req, res) {
  const profile = profileService.getProfile(req.params.customerId);
  if (!profile) return res.status(404).json({ error: "Customer not found." });
  return res.json({ data: profile });
}

module.exports = { list, getById };
