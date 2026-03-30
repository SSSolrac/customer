const express = require("express");
const c = require("../controllers/menuController");
const r = express.Router();

r.get("/", c.getMenu);
r.post("/", c.postMenu);
r.patch("/:menuItemId", c.patchMenu);
r.delete("/:menuItemId", c.deleteMenu);
r.get("/daily", c.getDaily);
r.post("/daily", c.postDaily);
r.patch("/daily/:dailyMenuId", c.patchDaily);
r.patch("/daily/:dailyMenuId/publish", c.publishDaily);

module.exports = r;
