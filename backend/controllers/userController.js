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
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "User registered!", userId });
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

    const token = jwt.sign(
      { userId: userExists.id, username },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.log("Error in user login : ", error);
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.user;
    const connection = await connectDB();
    const [result] = await connection.execute(
      "select * from users where id = ?",
      [userId]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "No user Found" });
    }

    return res.status(200).json({ result });
  } catch (error) {
    console.log("Error getting user : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const currentuser = async (req, res) => {
  try {
    const { userId } = req.user;
    return res.status(200).json({ userId: userId });
  } catch (error) {
    console.log("Error sending currnt user : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const isLogedIn = async (req, res) => {
  try {
    const userId = req.user;
    if (!userId) {
      return res.status(404).json({ message: "No token found" });
    }
    return res.status(200).json({ message: "User is genuine" });
  } catch (error) {
    console.log("Error during validating login : ", error);
  }
};

const userLogout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    res.status(200).json({ message: "User logged out successfully!" });
  } catch (error) {
    console.error("Error in user logout: ", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};

const addRecipe = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required!" });
    }

    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    const { userId } = req.user;

    if (!userId) {
      return res.status(400).json({ message: "User ID missing from token!" });
    }

    const connection = await connectDB();
    const [result] = await connection.execute(
      "INSERT INTO recipes (title, description, user_id) VALUES (?, ?, ?)",
      [title, description, userId]
    );

    res.status(200).json({
      message: "Recipe added successfully!",
      recipeId: result.insertId,
    });
  } catch (error) {
    console.error("Error in adding recipe! :", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addToFavorite = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id: recipeId } = req.params;
    const connection = await connectDB();
    const [recipe] = await connection.execute(
      "SELECT * FROM recipes WHERE id = ?",
      [recipeId]
    );

    if (recipe.length === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const [favorite] = await connection.execute(
      "SELECT * FROM favorites WHERE user_id = ? AND recipe_id = ?",
      [userId, recipeId]
    );

    if (favorite.length > 0) {
      await connection.execute(
        "DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?",
        [userId, recipeId]
      );
      return res.status(200).json({ message: "Recipe removed from favorites" });
    } else {
      await connection.execute(
        "INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)",
        [userId, recipeId]
      );
      return res.status(200).json({ message: "Recipe added to favorites" });
    }
  } catch (error) {
    console.error("Error toggling favorites:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserFav = async (req, res) => {
  try {
    const { userId } = req.user;
    const connection = await connectDB();

    const [result] = await connection.execute(
      `SELECT r.*
       FROM favorites f
       JOIN recipes r ON f.recipe_id = r.id
       WHERE f.user_id = ?`,
      [userId]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "No favorite recipe found" });
    }

    return res.status(200).json({ favorites: result });
  } catch (error) {
    console.log("Error fetching favorite recipes: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  userSignup,
  userLogin,
  addRecipe,
  userLogout,
  isLogedIn,
  addToFavorite,
  getUserFav,
  getUserById,
  currentuser,
};
