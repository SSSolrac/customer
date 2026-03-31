const fs = require("fs");
const path = require("path");

const MIME_TO_EXTENSION = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp"
};

function storeReceiptDataUrl(dataUrl, { orderId }) {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  if (!dataUrl.startsWith("data:")) return null;

  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) return null;

  const mimeType = String(match[1] || "").toLowerCase();
  const extension = MIME_TO_EXTENSION[mimeType];
  if (!extension) return null;

  const base64Payload = match[2] || "";
  if (!base64Payload) return null;

  const buffer = Buffer.from(base64Payload, "base64");
  if (!buffer.length) return null;

  const receiptsDir = path.join(__dirname, "..", "..", "uploads", "receipts");
  fs.mkdirSync(receiptsDir, { recursive: true });

  const safeId = String(orderId || "receipt").replace(/[^a-z0-9_-]/gi, "_");
  const fileName = `${safeId}.${extension}`;
  fs.writeFileSync(path.join(receiptsDir, fileName), buffer);

  return `/uploads/receipts/${fileName}`;
}

module.exports = { storeReceiptDataUrl };

