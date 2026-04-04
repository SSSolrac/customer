const inventoryService = require("../services/inventoryService");

function listIngredients(req, res) {
  return res.json({ data: inventoryService.listIngredients() });
}

function createIngredient(req, res) {
  return res.status(201).json({ data: inventoryService.createIngredient(req.body || {}) });
}

function updateIngredient(req, res) {
  const ingredient = inventoryService.updateIngredient(req.params.id, req.body || {});
  if (!ingredient) return res.status(404).json({ error: "Ingredient not found." });
  return res.json({ data: ingredient });
}

function deleteIngredient(req, res) {
  const ok = inventoryService.deleteIngredient(req.params.id);
  if (!ok) return res.status(404).json({ error: "Ingredient not found." });
  return res.status(204).send();
}

function listRecipeLines(req, res) {
  return res.json({ data: inventoryService.listRecipeLines() });
}

function createRecipeLine(req, res) {
  return res.status(201).json({ data: inventoryService.createRecipeLine(req.body || {}) });
}

function updateRecipeLine(req, res) {
  const line = inventoryService.updateRecipeLine(req.params.id, req.body || {});
  if (!line) return res.status(404).json({ error: "Recipe line not found." });
  return res.json({ data: line });
}

function deleteRecipeLine(req, res) {
  const ok = inventoryService.deleteRecipeLine(req.params.id);
  if (!ok) return res.status(404).json({ error: "Recipe line not found." });
  return res.status(204).send();
}

module.exports = {
  listIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  listRecipeLines,
  createRecipeLine,
  updateRecipeLine,
  deleteRecipeLine
};
