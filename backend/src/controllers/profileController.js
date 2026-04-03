const profileService = require("../services/profileService");
const { validateProfilePayload } = require("../validators/profileValidators");

function myId(req) {
  return req.query.customerId || req.header("x-customer-id") || "guest";
}

function getMe(req, res) {
  return res.json({ data: profileService.getProfile(myId(req)) });
}

function putMe(req, res) {
  const errors = validateProfilePayload(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(", ") });
  return res.json({ data: profileService.upsertProfile(myId(req), req.body || {}) });
}

module.exports = { getMe, putMe };
