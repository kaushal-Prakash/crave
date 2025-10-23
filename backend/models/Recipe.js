import connectDB from "../services/db.js";

export const createRecipe = async (title, description, user_id) => {
  try {
    const connection = await connectDB();
    const [result] = await connection.execute(
      "INSERT INTO recipes (title, description, user_id) VALUES (?, ?, ?)",
      [title, description, user_id]
    );
    // The insertId is a property on the result object returned by the connection.execute() method after an INSERT statement has successfully executed.
    return result.insertId; // <-- This returns the new recipe's ID
  } catch (error) {
    throw error;
  }
};

export const getAllRecipes = async () => {
  try {
    const connection = await connectDB();
    // The syntax const [rows] is a JavaScript way to extract the first element of that returned array and name it rows. So u can change it to other names too.
    const [rows] = await connection.execute("SELECT * FROM recipes order by id desc");
    return rows;
  } catch (error) {
    throw error;
  }
};
