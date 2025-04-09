import express from "express";
import { upload, imgUpload } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/upload", upload.single("image"), imgUpload);

export default router;
