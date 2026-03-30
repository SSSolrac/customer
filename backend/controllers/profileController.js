const profileService = require("../services/profileService");

function getCustomerId(req) {
  return req.query.customerId || req.header("x-customer-id") || "guest";
}

function getMyProfile(req, res) {
  const profile = profileService.getProfile(getCustomerId(req));
  return res.json({ profile: profile || null });
}

function updateMyProfile(req, res) {
  const profile = profileService.upsertProfile(getCustomerId(req), req.body || {});
  return res.json({ profile });
}

module.exports = {
  getMyProfile,
  updateMyProfile
};
