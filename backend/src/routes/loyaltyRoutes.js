const express = require("express");
const c = require("../controllers/loyaltyController");
const r = express.Router();

r.get("/:customerId", c.getByCustomer);

module.exports = r;
