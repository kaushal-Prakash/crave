import express from "express";
import { getRecipeById, getRecipes, updateRecipe } from "../controllers/recipeController.js";

const router = express.Router();

router.post("/update-recipe",updateRecipe);
router.get("/get-recipes", getRecipes);
router.get("/get-recipe-by-id",getRecipeById);

export default router;
