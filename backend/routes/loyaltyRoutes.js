const express = require("express");
const controller = require("../controllers/loyaltyController");

const router = express.Router();

router.get("/:customerId", controller.getLoyalty);

module.exports = router;
