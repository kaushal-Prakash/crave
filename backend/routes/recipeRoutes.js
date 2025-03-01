import express from "express";
import { getRecipeById, getRecipes, updateRecipe } from "../controllers/recipeController.js";

const router = express.Router();

router.post("/update-recipe",updateRecipe);
router.post("/get-recipe-by-id",getRecipeById);
router.get("/get-recipes", getRecipes);

export default router;
