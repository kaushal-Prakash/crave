import { jest } from '@jest/globals';
import { userSignup, userLogin, isLogedIn, userLogout, addRecipe } from '../../controllers/userController.js';
import { getRecipeById, updateRecipe } from '../../controllers/recipeController.js';

describe("White-Box Unit Testing: Controllers Validation & Logic", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      cookies: {},
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Positive Testing: Successful Controller Operations", () => {
    it("[Positive] isLogedIn: Should return 200 when req.user is populated", async () => {
      req.user = { userId: 1, username: "jay" };

      await isLogedIn(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "User is genuine" });
    });

    it("[Positive] userLogout: Should clear auth cookie and return 200", async () => {
      await userLogout(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        "",
        expect.objectContaining({
          httpOnly: true,
          expires: expect.any(Date),
          path: "/",
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "User logged out successfully!" });
    });
  });

  describe("Negative Testing: Validation & Missing Parameters", () => {
    describe("userSignup Validation", () => {
      it("[Negative] userSignup: Should return 400 when fullName is missing", async () => {
        req.body = { username: "jay", email: "jay@example.com", password: "password123" };

        await userSignup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "All fields are required" });
      });

      it("[Negative] userSignup: Should return 400 when username is missing", async () => {
        req.body = { fullName: "Jay User", email: "jay@example.com", password: "password123" };

        await userSignup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "All fields are required" });
      });

      it("[Negative] userSignup: Should return 400 when email is missing", async () => {
        req.body = { fullName: "Jay User", username: "jay", password: "password123" };

        await userSignup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "All fields are required" });
      });

      it("[Negative] userSignup: Should return 400 when password is missing", async () => {
        req.body = { fullName: "Jay User", username: "jay", email: "jay@example.com" };

        await userSignup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "All fields are required" });
      });

      it("[Negative] userSignup: Should return 400 when body is empty", async () => {
        req.body = {};

        await userSignup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "All fields are required" });
      });
    });

    describe("userLogin Validation", () => {
      it("[Negative] userLogin: Should return 204 when username is missing", async () => {
        req.body = { password: "password123" };

        await userLogin(req, res);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).toHaveBeenCalledWith({ message: "Fill all credentials" });
      });

      it("[Negative] userLogin: Should return 204 when password is missing", async () => {
        req.body = { username: "jay" };

        await userLogin(req, res);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).toHaveBeenCalledWith({ message: "Fill all credentials" });
      });

      it("[Negative] userLogin: Should return 204 when credentials body is empty", async () => {
        req.body = {};

        await userLogin(req, res);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).toHaveBeenCalledWith({ message: "Fill all credentials" });
      });
    });

    describe("isLogedIn Validation", () => {
      it("[Negative] isLogedIn: Should return 204 when req.user is missing/undefined", async () => {
        req.user = undefined;

        await isLogedIn(req, res);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).toHaveBeenCalledWith({ message: "No token found" });
      });
    });

    describe("addRecipe Validation", () => {
      it("[Negative] addRecipe: Should return 400 when title is missing", async () => {
        req.body = { description: "Delicious recipe description" };

        await addRecipe(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Title and description are required!" });
      });

      it("[Negative] addRecipe: Should return 400 when description is missing", async () => {
        req.body = { title: "Pasta" };

        await addRecipe(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Title and description are required!" });
      });
    });

    describe("recipeController Validation", () => {
      it("[Negative] getRecipeById: Should return 204 when recipe ID is missing", async () => {
        req.body = {};

        await getRecipeById(req, res);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).toHaveBeenCalledWith({ message: "Id not found in request!" });
      });

      it("[Negative] updateRecipe: Should return 204 when required update details are missing", async () => {
        req.body = { id: 1, title: "Updated Title" }; // description missing

        await updateRecipe(req, res);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).toHaveBeenCalledWith({ message: "Enter all details" });
      });
    });
  });
});
