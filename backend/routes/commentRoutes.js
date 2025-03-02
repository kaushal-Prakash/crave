import express from "express";
import { getRecipeComments } from "../controllers/commentsController.js";

const router = express.Router();

router.get("/get-recipe-comments/:id",getRecipeComments);
router.post("/add", async (req, res) => {
  const { content, user_id, recipe_id } = req.body;
  if (!content || !user_id || !recipe_id) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const commentId = await createComment(content, user_id, recipe_id);
    res.status(201).json({ message: "Comment added!", commentId });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/:recipe_id", async (req, res) => {
  try {
    const comments = await getCommentsByRecipe(req.params.recipe_id);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
