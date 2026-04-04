const express = require("express");
const c = require("../controllers/importController");

const r = express.Router();

r.post("/sales/preview", c.previewSales);
r.post("/sales", c.importSales);
r.get("/history", c.getHistory);

module.exports = r;
