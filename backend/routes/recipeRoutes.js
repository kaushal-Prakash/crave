import express from "express";
import { getRecipeById, getRecipes } from "../controllers/recipeController.js";

const router = express.Router();

router.get("/get-recipes", getRecipes);
router.get("/get-recipe-by-id",getRecipeById);

export default router;
