const express = require("express");
const c = require("../controllers/inventoryController");

const r = express.Router();

r.get("/ingredients", c.listIngredients);
r.post("/ingredients", c.createIngredient);
r.put("/ingredients/:id", c.updateIngredient);
r.delete("/ingredients/:id", c.deleteIngredient);

r.get("/recipes", c.listRecipeLines);
r.post("/recipes", c.createRecipeLine);
r.put("/recipes/:id", c.updateRecipeLine);
r.delete("/recipes/:id", c.deleteRecipeLine);

module.exports = r;
