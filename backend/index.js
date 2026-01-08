import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./services/db.js";
import userRoutes from "./routes/userRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import cookieParser from "cookie-parser";
import authMiddleware from "./middlewares/auth.js";
import http from "http";
import { initSocket } from "./websockets/socket.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  credentials: true,
  origin: [process.env.FRONTEND, "http://localhost:3000"]
}));
app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);

// Routes
app.use("/users", userRoutes);
app.use("/recipes", recipeRoutes);
app.use("/comments", commentRoutes);
app.use("/", uploadRoutes )

// Static folder
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Server is UP!");
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log("🛜 Server running on port:", port);
});


const server = http.createServer(app)
initSocket(server)   // attach realtime engine