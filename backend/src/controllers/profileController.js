const profileService = require("../services/profileService");
const { validateProfilePayload } = require("../validators/profileValidators");

function myId(req) {
  return req.query.customerId || req.header("x-customer-id") || "guest";
}

function getMe(req, res) {
  res.json({ profile: profileService.getProfile(myId(req)) });
}

function putMe(req, res) {
  const errors = validateProfilePayload(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(", ") });
  res.json({ profile: profileService.upsertProfile(myId(req), req.body || {}) });
}

module.exports = { getMe, putMe };
