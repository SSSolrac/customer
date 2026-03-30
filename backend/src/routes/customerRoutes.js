const express = require("express");
const c = require("../controllers/customerController");
const r = express.Router();

r.get("/", c.list);
r.get("/:customerId", c.getById);

module.exports = r;
