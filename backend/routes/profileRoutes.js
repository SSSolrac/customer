const express = require("express");
const controller = require("../controllers/profileController");

const router = express.Router();

router.get("/me", controller.getMyProfile);
router.put("/me", controller.updateMyProfile);

module.exports = router;
