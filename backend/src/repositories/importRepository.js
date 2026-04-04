const state = require("../models/state");

function createImportedSale(entry) {
  state.importedSales.push(entry);
  return entry;
}

function listImportedSales() {
  return [...state.importedSales];
}

function createImportHistory(entry) {
  state.importHistory.unshift(entry);
  return entry;
}

function listImportHistory() {
  return [...state.importHistory];
}

module.exports = {
  createImportedSale,
  listImportedSales,
  createImportHistory,
  listImportHistory
};
