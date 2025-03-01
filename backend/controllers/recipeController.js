import { getAllRecipes } from "../models/Recipe.js";

const getRecipes = async (req,res) => {
    try {
        const recipes = await getAllRecipes();
        if(!recipes){
            return res.status(404).json({message : "No recipes found"});
        }

        return res.status(200).json({recipes : recipes});
    } catch (error) {
        console.log("Error in fetching recipes : ",error);
        return res.status(500).json({message : "Internal server Error"});
    }
}

export {getRecipes};