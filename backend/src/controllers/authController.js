const authService = require("../services/authService");

function postLoginHistory(req, res) {
  res.status(201).json({ entry: authService.logLoginHistory(req.body || {}) });
}

function getLoginHistory(req, res) {
  res.json({ entries: authService.getLoginHistory() });
}

module.exports = { postLoginHistory, getLoginHistory };
