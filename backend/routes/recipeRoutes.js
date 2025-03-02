import express from "express";
import { getRecipeById, getRecipes, getUserRecipes, updateRecipe } from "../controllers/recipeController.js";

const router = express.Router();

router.post("/update-recipe",updateRecipe);
router.post("/get-recipe-by-id",getRecipeById);
router.get("/get-recipes", getRecipes);
router.get("/get-user-recipes",getUserRecipes);

export default router;
