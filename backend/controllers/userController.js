import { createUser, getUserByEmail } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSignup = async (req, res) => {
  const { fullName, username, email, password } = req.body;

  if (!username || !email || !password || !fullName) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userExists = await getUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const userId = await createUser(fullName, username, email, hashedPassword);
    console.log("user created");
    const token = jwt.sign({ userId, username }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ message: "User registered!", userId });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};

export { userSignup };
