const express = require("express");
const c = require("../controllers/authController");
const r = express.Router();

r.post("/login-history", c.postLoginHistory);
r.get("/login-history", c.getLoginHistory);

module.exports = r;
