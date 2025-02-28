import connectDB from "../services/db.js";

export const createComment = async (content, user_id, recipe_id) => {
  try {
    const connection = await connectDB();
    const [result] = await connection.execute(
      "INSERT INTO comments (content, user_id, recipe_id) VALUES (?, ?, ?)",
      [content, user_id, recipe_id]
    );
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

export const getCommentsByRecipe = async (recipe_id) => {
  try {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      "SELECT * FROM comments WHERE recipe_id = ?",
      [recipe_id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};
