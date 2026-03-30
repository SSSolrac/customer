const express = require("express");
const c = require("../controllers/orderController");
const r = express.Router();

r.get("/", c.list);
r.post("/", c.create);
r.get("/:orderId/history", c.history);
r.patch("/:orderId/status", c.patchStatus);
r.patch("/:orderId/payment", c.patchPayment);
r.get("/:orderId", c.getById);

module.exports = r;
