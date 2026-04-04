const state = require("../models/state");

function listIngredients() {
  return [...state.ingredients];
}

function getIngredientById(id) {
  return state.ingredients.find((entry) => entry.id === id) || null;
}

function createIngredient(ingredient) {
  state.ingredients.push(ingredient);
  return ingredient;
}

function updateIngredient(id, patch) {
  const idx = state.ingredients.findIndex((entry) => entry.id === id);
  if (idx < 0) return null;
  state.ingredients[idx] = { ...state.ingredients[idx], ...patch };
  return state.ingredients[idx];
}

function removeIngredient(id) {
  const before = state.ingredients.length;
  state.ingredients = state.ingredients.filter((entry) => entry.id !== id);
  state.recipeLines = state.recipeLines.filter((entry) => entry.ingredientId !== id);
  return before !== state.ingredients.length;
}

function listRecipeLines() {
  return [...state.recipeLines];
}

function getRecipeLineById(id) {
  return state.recipeLines.find((entry) => entry.id === id) || null;
}

function createRecipeLine(entry) {
  state.recipeLines.push(entry);
  return entry;
}

function updateRecipeLine(id, patch) {
  const idx = state.recipeLines.findIndex((entry) => entry.id === id);
  if (idx < 0) return null;
  state.recipeLines[idx] = { ...state.recipeLines[idx], ...patch };
  return state.recipeLines[idx];
}

function removeRecipeLine(id) {
  const before = state.recipeLines.length;
  state.recipeLines = state.recipeLines.filter((entry) => entry.id !== id);
  return before !== state.recipeLines.length;
}

module.exports = {
  listIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  removeIngredient,
  listRecipeLines,
  getRecipeLineById,
  createRecipeLine,
  updateRecipeLine,
  removeRecipeLine
};
