import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./services/db.js";
import userRoutes from "./routes/userRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import cookieParser from "cookie-parser";
import authMiddleware from "./middlewares/auth.js";

dotenv.config();

connectDB();

const app = express();
app.use(cors({
  credentials: true,
  origin : process.env.FRONTEND | "http://localhost:3000"
}));
app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);

app.use("/users", userRoutes);
app.use("/recipes", recipeRoutes);
app.use("/comments", commentRoutes);

app.get("/", (req, res) => {
  res.send("Server is UP!");
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log("🛜 Server running on port:", port);
});
