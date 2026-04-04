const express = require("express");
const c = require("../controllers/menuController");

const r = express.Router();

r.get("/daily", c.getDaily);
r.put("/daily", c.putDaily);
r.post("/daily/publish", c.publishDaily);
r.post("/daily/unpublish", c.unpublishDaily);
r.post("/daily/clear", c.clearDaily);

r.get("/", c.getMenu);
r.post("/", c.postMenu);
r.put("/:id", c.putMenu);
r.delete("/:id", c.deleteMenu);

module.exports = r;
