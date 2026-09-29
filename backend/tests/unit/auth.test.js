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
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Statement/Branch Coverage: Should call next() for open routes", () => {
    req.path = "/users/user-login";
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("Statement/Branch Coverage: Should return 401 if no token is provided for protected routes", () => {
    req.path = "/protected-route";
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Access denied. No token provided." });
    expect(next).not.toHaveBeenCalled();
  });

  it("Statement/Branch Coverage: Should return 400 if token is invalid", () => {
    req.path = "/protected-route";
    req.cookies.token = "invalid_token";
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token." });
    expect(next).not.toHaveBeenCalled();
  });

  it("Statement/Branch Coverage: Should set req.user and call next() if token is valid", () => {
    req.path = "/protected-route";
    req.cookies.token = "valid_token";
    const decodedPayload = { id: 1, name: "Test User" };
    jest.spyOn(jwt, 'verify').mockReturnValue(decodedPayload);

    authMiddleware(req, res, next);
    expect(req.user).toEqual(decodedPayload);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
