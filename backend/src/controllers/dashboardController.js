const dashboardService = require("../services/dashboardService");

function getSummary(req, res) {
  return res.json({ data: dashboardService.getSummary(req.query.range) });
}

module.exports = { getSummary };
