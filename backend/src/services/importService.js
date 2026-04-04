const { makeId } = require("../utils/id");
const importRepository = require("../repositories/importRepository");

function parseCsv(text) {
  const rows = String(text || "").trim().split(/\r?\n/).filter(Boolean);
  if (rows.length < 2) return [];
  const headers = rows[0].split(",").map((entry) => entry.trim());
  return rows.slice(1).map((line, rowIndex) => {
    const values = line.split(",").map((entry) => entry.trim());
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] ?? "";
      acc.__row = rowIndex + 2;
      return acc;
    }, {});
  });
}

function normalizeStatus(value) {
  const normalized = String(value || "pending").trim().toLowerCase();
  if (["pending", "preparing", "ready", "completed", "cancelled", "out_for_delivery", "delivered"].includes(normalized)) return normalized;
  return "completed";
}

function normalizePaymentMethod(value) {
  const normalized = String(value || "qrph").trim().toLowerCase();
  if (["qrph", "gcash", "maribank", "bdo", "cash"].includes(normalized)) return normalized;
  return "qrph";
}

function normalizeDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function normalizeRow(row) {
  const createdAt = normalizeDate(row.createdAt || row.date || row.soldAt);
  const total = Number(row.total || row.amount || 0);
  const status = normalizeStatus(row.status);
  const paymentMethod = normalizePaymentMethod(row.paymentMethod || row.payment);
  const customerCode = String(row.customerCode || "").trim() || null;
  const itemCode = String(row.itemCode || row.menuItemCode || "").trim() || null;

  const errors = [];
  if (!createdAt) errors.push("Invalid date");
  if (!Number.isFinite(total) || total < 0) errors.push("Invalid total");

  return {
    valid: errors.length === 0,
    errors,
    normalized: {
      id: makeId("import_sale"),
      source: "csv",
      orderNumber: row.orderNumber || `IMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt,
      total,
      status,
      paymentMethod,
      customerCode,
      itemCode,
      customerName: row.customerName || "Imported Customer",
      itemName: row.itemName || "Imported Item"
    }
  };
}

function previewSalesImport(payload) {
  const parsedRows = parseCsv(payload.csv || payload.content || "");
  const mapped = parsedRows.map(normalizeRow);

  return {
    summary: {
      totalRows: mapped.length,
      validRows: mapped.filter((entry) => entry.valid).length,
      invalidRows: mapped.filter((entry) => !entry.valid).length
    },
    rows: mapped.map((entry, index) => ({
      row: parsedRows[index].__row,
      valid: entry.valid,
      errors: entry.errors,
      normalized: entry.normalized
    }))
  };
}

function commitSalesImport(payload) {
  const preview = previewSalesImport(payload);
  const committedRows = [];

  preview.rows.forEach((entry) => {
    if (!entry.valid) return;
    committedRows.push(importRepository.createImportedSale(entry.normalized));
  });

  const history = importRepository.createImportHistory({
    id: makeId("import_history"),
    importedAt: new Date().toISOString(),
    fileName: payload.fileName || "uploaded.csv",
    summary: {
      totalRows: preview.summary.totalRows,
      committedRows: committedRows.length,
      failedRows: preview.summary.invalidRows
    }
  });

  return {
    import: history,
    rows: committedRows,
    errors: preview.rows.filter((entry) => !entry.valid)
  };
}

function listImportHistory() {
  return importRepository.listImportHistory();
}

function listImportedSales() {
  return importRepository.listImportedSales();
}

module.exports = {
  previewSalesImport,
  commitSalesImport,
  listImportHistory,
  listImportedSales
};
