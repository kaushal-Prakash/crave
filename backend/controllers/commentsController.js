import connectDB from "../services/db.js";

const addComments = async (req, res) => {
  try {
    const { userId } = req.user;
  } catch (error) {
    console.log("Error adding comments : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getRecipeComments = async(req,res) => {
    try {
        const {id : recipeId} = req.params;

        const connection = await connectDB();
        const [result] = await connection.execute("select * from comments where recipe_id = ?",[recipeId]);

        if(result.length === 0){
            return res.status(200).json({message : "No comments added yet"});
        }

        return res.status(200).json({result});
    } catch (error) {
        console.log("Error fetching recipe  comments : ",error);
        return res.status(500).json({message : "Internal Server Error"});
    }
}

export { addComments, getRecipeComments };
