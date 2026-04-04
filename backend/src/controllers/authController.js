const authService = require("../services/authService");

function login(req, res) {
  const user = authService.login(req.body || {});
  if (!user) return res.status(401).json({ error: "Invalid credentials." });
  return res.json({ data: user });
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

module.exports = { login, logout, postLoginHistory, getLoginHistory, getLoginHistoryStats };
