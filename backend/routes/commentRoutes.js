import express from "express";
import { addComments, getRecipeComments } from "../controllers/commentsController.js";

const router = express.Router();

router.get("/get-recipe-comments/:id",getRecipeComments);
router.post("/add/:id", addComments);

router.get("/:recipe_id", async (req, res) => {
  try {
    const comments = await getCommentsByRecipe(req.params.recipe_id);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
