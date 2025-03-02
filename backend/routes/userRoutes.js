import express from "express";
import { addRecipe, addToFavorite, isLogedIn, userLogin, userLogout, userSignup } from "../controllers/userController.js";

const router = express.Router();

router.post("/user-signup", userSignup);
router.post("/user-login", userLogin);
router.post("/add-recipe",addRecipe);
router.get("/user-logout",userLogout);
router.get("/is-loged-in",isLogedIn);
router.get("/add-to-fav/:id",addToFavorite);

export default router;
