import express from "express";
import { createRecipe, getAllRecipes } from "../models/Recipe.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  const { title, description, user_id } = req.body;
  if (!title || !description || !user_id) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const recipeId = await createRecipe(title, description, user_id);
    res.status(201).json({ message: "Recipe added!", recipeId });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const recipes = await getAllRecipes();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
