import connectDB from "../services/db.js";

export const createRecipe = async (title, description, user_id) => {
  try {
    const connection = await connectDB();
    const [result] = await connection.execute(
      "INSERT INTO recipes (title, description, user_id) VALUES (?, ?, ?)",
      [title, description, user_id]
    );
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

export const getAllRecipes = async () => {
  try {
    const connection = await connectDB();
    const [rows] = await connection.execute("SELECT * FROM recipes order by id desc");
    return rows;
  } catch (error) {
    throw error;
  }
};
