import jwt from "jsonwebtoken";
import authMiddleware from "../../middlewares/auth.js";
import { jest } from '@jest/globals';

describe("White-Box Unit Testing: authMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      path: "",
      cookies: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Positive Testing: Allowed Routes & Valid Tokens", () => {
    it("[Positive] Open Route: Should call next() for /users/user-login without requiring a token", () => {
      req.path = "/users/user-login";
      authMiddleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("[Positive] Open Route: Should call next() for /users/user-signup without requiring a token", () => {
      req.path = "/users/user-signup";
      authMiddleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("[Positive] Open Route: Should call next() for public recipe routes", () => {
      req.path = "/recipes/get-recipes";
      authMiddleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("[Positive] Static Asset: Should call next() for static image paths (/images/)", () => {
      req.path = "/images/food-123.jpg";
      authMiddleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("[Positive] Valid Token: Should set req.user and call next() when a valid token is provided", () => {
      req.path = "/protected-route";
      req.cookies.token = "valid_token";
      const decodedPayload = { userId: 1, username: "jay" };
      jest.spyOn(jwt, 'verify').mockReturnValue(decodedPayload);

      authMiddleware(req, res, next);

      expect(req.user).toEqual(decodedPayload);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("Negative Testing: Missing, Invalid, or Expired Tokens", () => {
    it("[Negative] Missing Token: Should return 401 if no token is provided for protected routes", () => {
      req.path = "/protected-route";
      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Access denied. No token provided." });
      expect(next).not.toHaveBeenCalled();
    });

    it("[Negative] Invalid Token: Should return 400 if token verification fails", () => {
      req.path = "/protected-route";
      req.cookies.token = "tampered_token";
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error("JsonWebTokenError: invalid signature");
      });

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid token." });
      expect(next).not.toHaveBeenCalled();
    });

    it("[Negative] Expired Token: Should return 400 if token has expired", () => {
      req.path = "/protected-route";
      req.cookies.token = "expired_token";
      const expiredError = new Error("TokenExpiredError: jwt expired");
      expiredError.name = "TokenExpiredError";
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw expiredError;
      });

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid token." });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
