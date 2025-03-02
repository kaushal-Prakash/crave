import connectDB from "../services/db.js";

export const createUser = async (fullName, username, email, password) => {
  try {
    const connection = await connectDB();
    const [result] = await connection.execute(
      "INSERT INTO users (fullName,username, email, password) VALUES (?,?, ?, ?)",
      [fullName, username, email, password]
    );
    return result.insertId;
  } catch (error) {
    console.log("Error in creating user : ", error);
  }
};

export const getUserByEmail = async (email) => {
  try {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows[0];
  } catch (error) {
    throw error;
  }
};
