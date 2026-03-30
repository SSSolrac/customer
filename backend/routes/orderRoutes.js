const express = require("express");
const controller = require("../controllers/orderController");

const router = express.Router();

router.post("/", controller.createOrder);
router.get("/", controller.getOrders);
router.get("/latest", controller.getLatestOrder);
router.get("/:orderId/history", controller.getOrderStatusHistory);
router.get("/:orderId", controller.getOrderById);

module.exports = router;
