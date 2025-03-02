import { getAllRecipes } from "../models/Recipe.js";
import connectDB from "../services/db.js";

const getRecipes = async (req, res) => {
  try {
    const recipes = await getAllRecipes();
    if (!recipes) {
      return res.status(404).json({ message: "No recipes found" });
    }

    return res.status(200).json({ recipes: recipes });
  } catch (error) {
    console.log("Error in fetching recipes : ", error);
    return res.status(500).json({ message: "Internal server Error" });
  }
};

const getRecipeById = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(404).json({ message: "Id not found in request!" });
    }

    const connection = await connectDB();
    const [result] = await connection.execute(
      "select * from recipes where id = ?",
      [id]
    );
    if (!result) {
      return res.status(404).json({ message: "No recipe found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.log("Error in fetching recipe by id : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateRecipe = async (req, res) => {
  try {
    const { id, title, description } = req.body;
    if (!id || !title || !description) {
      return res.status(404).json({ message: "Enter all details" });
    }

    const connection = await connectDB();
    const [result] = await connection.execute(
      "update recipes set title = ?, description = ? where id = ?",
      [title, description, id]
    );

    const { warningStatus } = result;
    if (warningStatus > 0) {
      return res.status(400).json({ message: "Failed to update recipe!" });
    }
    return res.status(200).json({ result });
  } catch (error) {
    console.log("Error in updating recipe : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserRecipes = async (req, res) => {
  try {
    const { userId } = req.user;
    const connection = await connectDB();
    const [result] = await connection.execute(
      "select * from recipes where user_id = ?",
      [userId]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "No recipes found" });
    }

    return res.status(200).json({ result });
  } catch (error) {
    console.log("Error fetching user recipes : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const { id: recipeId } = req.params;
    const connection = await connectDB();

    const [recipe] = await connection.execute(
      "SELECT * FROM recipes WHERE id = ?",
      [recipeId]
    );

    if (recipe.length === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    await connection.execute("DELETE FROM recipes WHERE id = ?", [recipeId]);

    await connection.execute("DELETE FROM favorites WHERE recipe_id = ?", [
      recipeId,
    ]);

    return res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  getRecipes,
  getRecipeById,
  updateRecipe,
  getUserRecipes,
  deleteRecipe,
};
