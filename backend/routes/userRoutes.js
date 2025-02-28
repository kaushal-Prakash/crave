import express from "express";
import { addRecipe, userLogin, userLogout, userSignup } from "../controllers/userController.js";

const router = express.Router();

router.post("/user-signup", userSignup);
router.post("/user-login", userLogin);
router.post("/add-recipe",addRecipe);
router.get("/user-logout",userLogout);

export default router;
