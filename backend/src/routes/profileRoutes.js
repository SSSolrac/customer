const express = require("express");
const c = require("../controllers/profileController");
const r = express.Router();

r.get("/me", c.getMe);
r.put("/me", c.putMe);

module.exports = r;
