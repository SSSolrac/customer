const inventoryRepository = require("../repositories/inventoryRepository");
const { makeId } = require("../utils/id");
const { nextCode, ensureCounterAtLeast } = require("../utils/codeGenerator");

const VALID_UNITS = new Set(["g", "kg", "ml", "l", "pcs"]);

function counterFromCode(code, prefix) {
  const value = String(code || "").trim();
  if (!value.startsWith(`${prefix}-`)) return 0;
  return Number(value.split("-")[1] || 0);
}

function listIngredients() {
  return inventoryRepository.listIngredients().map((item) => {
    ensureCounterAtLeast("ingredientCode", counterFromCode(item.code, "ING"));
    return { ...item };
  });
}

function getIngredient(id) {
  return inventoryRepository.getIngredientById(id);
}

function createIngredient(payload) {
  const now = new Date().toISOString();
  const unit = VALID_UNITS.has(payload.unit) ? payload.unit : "pcs";
  const ingredient = {
    id: makeId("ingredient"),
    code: nextCode("ingredientCode", "ING"),
    name: String(payload.name || "").trim(),
    unit,
    stockOnHand: Number(payload.stockOnHand || 0),
    reorderLevel: Number(payload.reorderLevel || 0),
    isActive: payload.isActive ?? true,
    createdAt: now,
    updatedAt: now
  };
  return inventoryRepository.createIngredient(ingredient);
}

function updateIngredient(id, payload) {
  const current = getIngredient(id);
  if (!current) return null;
  const patch = {
    ...(payload.name !== undefined ? { name: String(payload.name).trim() } : {}),
    ...(payload.unit !== undefined && VALID_UNITS.has(payload.unit) ? { unit: payload.unit } : {}),
    ...(payload.stockOnHand !== undefined ? { stockOnHand: Number(payload.stockOnHand) } : {}),
    ...(payload.reorderLevel !== undefined ? { reorderLevel: Number(payload.reorderLevel) } : {}),
    ...(payload.isActive !== undefined ? { isActive: Boolean(payload.isActive) } : {}),
    updatedAt: new Date().toISOString()
  };
  return inventoryRepository.updateIngredient(id, patch);
}

function deleteIngredient(id) {
  return inventoryRepository.removeIngredient(id);
}

function listRecipeLines() {
  return inventoryRepository.listRecipeLines();
}

function createRecipeLine(payload) {
  const now = new Date().toISOString();
  const line = {
    id: makeId("recipe_line"),
    menuItemId: String(payload.menuItemId || ""),
    ingredientId: String(payload.ingredientId || ""),
    quantityRequired: Number(payload.quantityRequired || 0),
    createdAt: now,
    updatedAt: now
  };
  return inventoryRepository.createRecipeLine(line);
}

function updateRecipeLine(id, payload) {
  const current = inventoryRepository.getRecipeLineById(id);
  if (!current) return null;
  return inventoryRepository.updateRecipeLine(id, {
    ...(payload.menuItemId !== undefined ? { menuItemId: String(payload.menuItemId || "") } : {}),
    ...(payload.ingredientId !== undefined ? { ingredientId: String(payload.ingredientId || "") } : {}),
    ...(payload.quantityRequired !== undefined ? { quantityRequired: Number(payload.quantityRequired || 0) } : {}),
    updatedAt: new Date().toISOString()
  });
}

function deleteRecipeLine(id) {
  return inventoryRepository.removeRecipeLine(id);
}

function ingredientStockAlerts() {
  return listIngredients().map((ingredient) => {
    const isOutOfStock = Number(ingredient.stockOnHand || 0) <= 0;
    const isLowStock = !isOutOfStock && Number(ingredient.stockOnHand || 0) <= Number(ingredient.reorderLevel || 0);
    return {
      ingredientId: ingredient.id,
      ingredientCode: ingredient.code,
      ingredientName: ingredient.name,
      status: isOutOfStock ? "out_of_stock" : isLowStock ? "low_stock" : "in_stock"
    };
  });
}

module.exports = {
  listIngredients,
  getIngredient,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  listRecipeLines,
  createRecipeLine,
  updateRecipeLine,
  deleteRecipeLine,
  ingredientStockAlerts
};
