import express from "express";
import { addComments, deleteComment, getRecipeComments, updateComment } from "../controllers/commentsController.js";

const router = express.Router();

router.post("/add/:id", addComments);
router.post("/update/:id", updateComment);
router.get("/get-recipe-comments/:id",getRecipeComments);
router.get("/delete/:id",deleteComment);

export default router;
