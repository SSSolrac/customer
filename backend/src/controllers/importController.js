const importService = require("../services/importService");

function previewSales(req, res) {
  return res.json({ data: importService.previewSalesImport(req.body || {}) });
}

function importSales(req, res) {
  return res.status(201).json({ data: importService.commitSalesImport(req.body || {}) });
}

function getHistory(req, res) {
  return res.json({ data: importService.listImportHistory() });
}

module.exports = { previewSales, importSales, getHistory };
