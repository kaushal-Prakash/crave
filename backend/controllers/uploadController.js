import multer from "multer";
import connectDB from "../services/db.js";
import path from "path";
import fs from "fs";

// Multer config
//Multer is a Node.js middleware for handling multipart/form-data, which is the encoding used when uploading files through HTML forms.
// It works with Express.js and saves uploaded files either:
// to disk (your local filesystem)

// Multipart is a way of sending different types of data (like text + files) in a single HTTP request — most commonly used with the content type:  multipart/form-data
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    allowedTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only JPEG, JPG, and PNG files are allowed."));
  },
});

const imgUpload = async (req, res) => {
  try {
    const { recipe_id } = req.body;
    const { file } = req;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!recipe_id) {
      // Delete the uploaded file if no recipe_id was provided
      fs.unlinkSync(path.join(process.cwd(), "uploads", file.filename));
      return res.status(400).json({ message: "Recipe ID is required" });
    }

    // Verify the recipe exists
    const connection = await connectDB();
    const [recipe] = await connection.execute(
      "SELECT id FROM recipes WHERE id = ?",
      [recipe_id]
    );

    if (recipe.length === 0) {
      // Delete the uploaded file if recipe doesn't exist
      fs.unlinkSync(path.join(process.cwd(), "uploads", file.filename));
      return res.status(404).json({ message: "Recipe not found" });
    }

    const imageUrl = `/uploads/${file.filename}`;

    await connection.execute(
      "INSERT INTO images (recipe_id, image_url) VALUES (?, ?)",
      [recipe_id, imageUrl]
    );

    return res
      .status(200)
      .json({ message: "File uploaded successfully", imageUrl });
  } catch (error) {
    console.log("Error in uploading image:", error);
    // Delete the uploaded file if an error occurred
    if (req.file) {
      fs.unlinkSync(path.join(process.cwd(), "uploads", req.file.filename));
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteImage = async (req, res) => {
  const { image_id } = req.body;

  if (!image_id) {
    return res.status(400).json({ message: "Image ID is required" });
  }

  try {
    const connection = await connectDB();

    // Get the image record
    const [rows] = await connection.execute(
      "SELECT image_url FROM images WHERE id = ?",
      [image_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    const imageUrl = rows[0].image_url;
    const filePath = path.join(
      process.cwd(),
      "uploads",
      path.basename(imageUrl)
    );

    // Delete file from the filesystem
    fs.unlink(filePath, async (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return res
          .status(500)
          .json({ message: "Failed to delete image! try again" });
      }

      // Delete from DB
      await connection.execute("DELETE FROM images WHERE id = ?", [image_id]);

      return res.status(200).json({ message: "Image deleted successfully" });
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getImagesByRecipeId = async (req, res) => {
  const { recipe_id } = req.params;

  if (!recipe_id) {
    return res.status(400).json({ message: "Recipe ID is required" });
  }

  try {
    const connection = await connectDB();
    const [images] = await connection.execute(
      "SELECT id, image_url FROM images WHERE recipe_id = ?",
      [recipe_id]
    );
    // It takes your JavaScript object ({ images: [...] }).
    // It calls JSON.stringify() internally.

    // It sends it as a JSON response with header:
    return res.status(200).json({ images });
  } catch (error) {
    console.error("Error fetching images by recipe ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { upload, imgUpload, deleteImage, getImagesByRecipeId };
