import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const openRoutes = [
    "/users/user-login",
    "/users/user-signup",
    "/",
    "/users/isLogedIn",
  ];
  if (openRoutes.includes(req.path)) {
    return next();
  }

  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

export default authMiddleware;
