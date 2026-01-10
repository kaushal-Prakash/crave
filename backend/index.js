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
import messageRoutes from "./routes/messageRoutes.js";
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
app.use("/messages", messageRoutes);
app.use("/", uploadRoutes )

// Static folder
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Server is UP!");
});

const port = process.env.PORT || 4000;

const server = http.createServer(app)
initSocket(server)   // attach realtime engine

//app.listen() secretly creates its own HTTP server
//WebSocket is not a separate port — It upgrades the HTTP connection.
//Socket.IO must hook into the exact same HTTP server that is listening.
//Golden Rule
// Only ONE HTTP server can exist per port.
// Socket.IO must be attached to that one.
// app.listen(port, () => {
//   console.log("🛜 Server running on port:", port);
// });

server.listen(port, () => {
  console.log("🛜 Server running on port:", port);
});