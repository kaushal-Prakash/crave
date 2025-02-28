import { createUser, getUserByEmail } from "../models/User.js";
import bcrypt, { hash } from "bcryptjs";

const userSignup = async (req, res) => {
  const { fullName,username, email, password } = req.body;

  if (!username || !email || !password ||!fullName) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const hashedPassword = await bcrypt.hash(process.env.SECRET_STRING,10);

  try {
    const userExists = await getUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const userId = await createUser(fullName,username, email, hashedPassword);
    res.status(201).json({ message: "User registered!", userId });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};

export { userSignup };
