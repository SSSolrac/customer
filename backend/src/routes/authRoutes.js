const express = require("express");
const c = require("../controllers/authController");

const r = express.Router();

r.post("/login", c.login);
r.post("/login-history", c.postLoginHistory);
r.get("/login-history", c.getLoginHistory);
r.get("/login-history/stats", c.getLoginHistoryStats);

module.exports = r;
