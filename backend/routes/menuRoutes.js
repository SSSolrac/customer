const express = require("express");
const controller = require("../controllers/menuController");

const router = express.Router();

router.get("/", controller.getMenu);
router.get("/daily", controller.getDailyMenu);

module.exports = router;
