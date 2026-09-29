import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import authMiddleware from "../../middlewares/auth.js";
import userRoutes from "../../routes/userRoutes.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Server is UP!");
});

describe("Black-Box Integration Testing: API Endpoints", () => {
  it("Should return 200 for base route /", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe("Server is UP!");
  });

  it("Should return 401 for protected routes without token", async () => {
    const res = await request(app).get("/users/some-protected-route");
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toBe("Access denied. No token provided.");
  });
});
