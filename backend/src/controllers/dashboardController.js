const dashboardService = require("../services/dashboardService");

function getSummary(req, res) {
  res.json(dashboardService.getSummary());
}

module.exports = { getSummary };
