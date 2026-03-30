const express = require("express");
const c = require("../controllers/dashboardController");
const r = express.Router();

r.get("/summary", c.getSummary);

module.exports = r;
