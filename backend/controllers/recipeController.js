import { response } from "express";
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
    const [result] = await connection.execute("select * from recipes where id = ?",[id]);
    if(!result){
        return res.status(404).json({message : "No recipe found"});
    }
    
    return res.status(200).json({result});
  } catch (error) {
    console.log("Error in fetching recipe by id : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { getRecipes, getRecipeById };
