const authService = require("../services/authService");
const { validateSignupPayload } = require("../validators/authValidators");

function login(req, res) {
  const user = authService.login(req.body || {});
  if (!user) return res.status(401).json({ error: "Invalid credentials." });
  return res.json({ data: user });
}

function signup(req, res) {
  const errors = validateSignupPayload(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(", ") });

  try {
    const user = authService.signup(req.body || {});
    return res.status(201).json({ data: user });
  } catch (error) {
    const status = Number(error?.status) || 500;
    return res.status(status).json({ error: error?.message || "Unable to create account." });
  }
}

function logout(req, res) {
  authService.logLoginHistory({ ...(req.body || {}), loginStatus: "logout", logoutTime: new Date().toISOString() });
  return res.status(204).send();
}

function postLoginHistory(req, res) {
  const saved = authService.logLoginHistory(req.body || {});
  return res.status(201).json({ data: saved });
}

function getLoginHistory(req, res) {
  const rows = authService.getLoginHistory();
  return res.json({ data: rows });
}

function getLoginHistoryStats(req, res) {
  return res.json({ data: authService.getLoginHistoryStats() });
}

module.exports = { login, signup, logout, postLoginHistory, getLoginHistory, getLoginHistoryStats };
