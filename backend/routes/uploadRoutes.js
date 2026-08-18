import express from "express";
import multer from "multer";
import {
  upload,
  imgUpload,
  deleteImage,
  getImagesByRecipeId,
} from "../controllers/uploadController.js";

const router = express.Router();

router.post("/upload", (req, res) => {

  // Use multer middleware to handle the file upload. upload.single("image") is a middleware function that processes the incoming request and extracts the file from the "image" field in the form data. It saves the file to the specified destination and then calls the next middleware (in this case, imgUpload) to handle further processing.
  
  upload.single("image")(req, res, function (err) { 
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({ message: err.message });
    }
    // Everything went fine, proceed with imgUpload
    imgUpload(req, res);
  });
});
router.post("/delete-image", deleteImage);
router.get("/images/:recipe_id", getImagesByRecipeId);

export default router;
