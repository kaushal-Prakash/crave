import connectDB from "../services/db.js";

const addComments = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id: recipeId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(404).json({ message: "Add all comment details first" });
    }

    const connection = await connectDB();
    const [result] = await connection.execute(
      "INSERT INTO comments (content, user_id, recipe_id) VALUES (?, ?, ?)",
      [content, userId, recipeId]
    );

    console.log(result);
    return res.status(200).json({ result });
  } catch (error) {
    console.log("Error adding comments : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getRecipeComments = async (req, res) => {
  try {
    const { id: recipeId } = req.params;

    const connection = await connectDB();
    const [result] = await connection.execute(
      "select * from comments where recipe_id = ?",
      [recipeId]
    );

    if (result.length === 0) {
      return res.status(200).json({ message: "No comments added yet" });
    }

    return res.status(200).json({ result });
  } catch (error) {
    console.log("Error fetching recipe  comments : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;

    const connection = await connectDB();
    const [result] = await connection.execute(
      "delete from comments where id = ?",
      [commentId]
    );

    return res
      .status(200)
      .json({ message: "Comment successfully deletd", result });
  } catch (error) {
    console.log("Error deleting comment : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const { content } = req.body;

    // Validate input
    if (!content) {
      return res
        .status(400)
        .json({ message: "Please provide content for the comment." });
    }

    const connection = await connectDB();

    const [result] = await connection.execute(
      "UPDATE comments SET content = ? WHERE id = ?",
      [content, commentId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Comment not found or no changes made." });
    }

    return res
      .status(200)
      .json({ message: "Comment successfully updated", result });
  } catch (error) {
    console.log("Error updating comment: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export { addComments, getRecipeComments, deleteComment, updateComment };
