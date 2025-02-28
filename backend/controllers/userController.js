import { createUser, getUserByEmail } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "../services/db.js";

const getUserByUsername = async (username) => {
  try {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    return rows[0];
  } catch (error) {
    console.log("Error getting user via username!");
  }
};

const userSignup = async (req, res) => {
  const { fullName, username, email, password } = req.body;

  if (!username || !email || !password || !fullName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userExists = await getUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const userId = await createUser(fullName, username, email, hashedPassword);

    const token = jwt.sign({ userId, username }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ message: "User registered!", userId });
  } catch (error) {
    res.status(500).json({ message: "Database error" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(404).json({ message: "Fill all credentials" });
    }

    const userExists = await getUserByUsername(username);
    if (!userExists) {
      return res.status(404).json({ message: "username not registered!" });
    }

    const token = jwt.sign({ userExists, username }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({message : "Login successful"})
  } catch (error) {
    console.log("Error in user login : ", error);
  }
};

export { userSignup, userLogin };
