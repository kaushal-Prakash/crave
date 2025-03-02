import express from "express";
import { deleteRecipe, getRecipeById, getRecipes, getUserRecipes, updateRecipe } from "../controllers/recipeController.js";

const router = express.Router();

router.post("/update-recipe",updateRecipe);
router.post("/get-recipe-by-id",getRecipeById);
router.get("/get-recipes", getRecipes);
router.get("/get-user-recipes",getUserRecipes);
router.get("/delete-recipe/:id",deleteRecipe);

export default router;
