import express from "express";
import { userLogin, userSignup } from "../controllers/userController.js";

const router = express.Router();

router.post("/user-signup", userSignup);
router.post("/user-login", userLogin);

export default router;
