import multer from "multer";
import connectDB from "../services/db.js";

// Multer config
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
      return res.status(400).json({ message: "Recipe ID is required" });
    }

    const imageUrl = `/uploads/${file.filename}`;
    const connection = await connectDB();

    await connection.execute(
      "INSERT INTO images (recipe_id, image_url) VALUES (?, ?)",
      [recipe_id, imageUrl]
    );

    return res.status(200).json({ message: "File uploaded successfully", imageUrl });
  } catch (error) {
    console.log("Error in uploading image:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { upload, imgUpload };
