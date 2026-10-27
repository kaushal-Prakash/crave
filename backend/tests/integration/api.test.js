import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import authMiddleware from "../../middlewares/auth.js";
import userRoutes from "../../routes/userRoutes.js";
import recipeRoutes from "../../routes/recipeRoutes.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);
app.use("/users", userRoutes);
app.use("/recipes", recipeRoutes);

app.get("/", (req, res) => {
  res.send("Server is UP!");
});

const JWT_SECRET = process.env.JWT_SECRET || "craveisfun";

// Helper to generate test JWT tokens
const createTestToken = (payload = { userId: 1, username: "jay" }, expiresIn = "1h") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

describe("Black-Box Integration Testing: API Endpoints", () => {
  describe("Positive Testing: Valid Requests & Authorized Access", () => {
    it("[Positive] Base Route: Should return 200 for health check /", async () => {
      const res = await request(app).get("/");
      expect(res.statusCode).toEqual(200);
      expect(res.text).toBe("Server is UP!");
    });

    it("[Positive] Protected Route: Should return 200 for /users/is-loged-in with valid JWT cookie", async () => {
      const token = createTestToken();
      const res = await request(app)
        .get("/users/is-loged-in")
        .set("Cookie", [`token=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("User is genuine");
    });

    it("[Positive] Logout: Should return 200 and clear cookie for /users/user-logout", async () => {
      const token = createTestToken();
      const res = await request(app)
        .get("/users/user-logout")
        .set("Cookie", [`token=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("User logged out successfully!");
      const setCookie = res.headers["set-cookie"];
      expect(setCookie).toBeDefined();
      expect(setCookie[0]).toContain("token=;");
    });

    it("[Positive] Public Open Route: Should reach /users/user-login without 401 Unauthorized", async () => {
      const res = await request(app)
        .post("/users/user-login")
        .send({});

      // Should not be rejected by auth middleware (status 401)
      expect(res.statusCode).not.toEqual(401);
    });

    it("[Positive] Public Open Route: Should reach /recipes/get-recipe-by-id without 401 Unauthorized", async () => {
      const res = await request(app)
        .post("/recipes/get-recipe-by-id")
        .send({});

      // Should bypass auth middleware without 401
      expect(res.statusCode).not.toEqual(401);
    });
  });

  describe("Negative Testing: Authentication & Input Validation Failures", () => {
    describe("Authentication Failures (Missing, Invalid, Expired Tokens)", () => {
      it("[Negative] Unauthorized: Should return 401 for protected /users/is-loged-in without token", async () => {
        const res = await request(app).get("/users/is-loged-in");
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe("Access denied. No token provided.");
      });

      it("[Negative] Unauthorized: Should return 401 for protected /users/get-user-fav without token", async () => {
        const res = await request(app).get("/users/get-user-fav");
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe("Access denied. No token provided.");
      });

      it("[Negative] Unauthorized: Should return 401 for protected /recipes/update-recipe without token", async () => {
        const res = await request(app)
          .post("/recipes/update-recipe")
          .send({ id: 1, title: "New title", description: "New desc" });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe("Access denied. No token provided.");
      });

      it("[Negative] Invalid Token: Should return 400 when malformed token is provided", async () => {
        const res = await request(app)
          .get("/users/is-loged-in")
          .set("Cookie", ["token=malformed.invalid.token"]);

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe("Invalid token.");
      });

      it("[Negative] Expired Token: Should return 400 when expired JWT token is provided", async () => {
        const expiredToken = createTestToken({ userId: 1, username: "jay" }, "-1s");
        const res = await request(app)
          .get("/users/is-loged-in")
          .set("Cookie", [`token=${expiredToken}`]);

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe("Invalid token.");
      });
    });

    describe("Payload & Input Validation Failures", () => {
      it("[Negative] userSignup: Should return 400 when required fields are missing", async () => {
        const res = await request(app)
          .post("/users/user-signup")
          .send({ email: "incomplete@example.com" });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe("All fields are required");
      });

      it("[Negative] userLogin: Should return 204 when credentials are missing", async () => {
        const res = await request(app)
          .post("/users/user-login")
          .send({});

        expect(res.statusCode).toEqual(204);
      });

      it("[Negative] getRecipeById: Should return 204 when recipe ID is not sent in request", async () => {
        const res = await request(app)
          .post("/recipes/get-recipe-by-id")
          .send({});

        expect(res.statusCode).toEqual(204);
      });

      it("[Negative] addRecipe: Should return 400 when title or description is missing", async () => {
        const token = createTestToken();
        const res = await request(app)
          .post("/users/add-recipe")
          .set("Cookie", [`token=${token}`])
          .send({ title: "Only Title Provided" });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe("Title and description are required!");
      });

      it("[Negative] updateRecipe: Should return 204 when update payload is incomplete", async () => {
        const token = createTestToken();
        const res = await request(app)
          .post("/recipes/update-recipe")
          .set("Cookie", [`token=${token}`])
          .send({ id: 1 }); // missing title & description

        expect(res.statusCode).toEqual(204);
      });
    });
  });
});
