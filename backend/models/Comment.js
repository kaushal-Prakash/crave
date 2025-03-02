import connectDB from "../services/db.js";

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
