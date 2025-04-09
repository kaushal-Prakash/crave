import express from "express";
import { upload, imgUpload, deleteImage } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/upload", upload.single("image"), imgUpload);
router.post("/delete-image", deleteImage);

export default router;
