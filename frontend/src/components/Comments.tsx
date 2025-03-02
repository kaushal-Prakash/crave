"use client";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { comment } from "@/types/types";

interface CommentComponentProps {
  recipeId: number;
}

function CommentComponent({ recipeId }: CommentComponentProps) {
  const [comments, setComments] = useState<comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storedUserId, setStoredUserId] = useState<number>();

  useEffect(() => {
    const storedUserId = localStorage.getItem("currentUserId");
    if (storedUserId) {
      setStoredUserId(Number(storedUserId));
    }
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}comments/get-recipe-comments/${recipeId}`,
          { withCredentials: true }
        );
        if (response.status === 200) {
          setComments(response.data.result);
        } else {
          throw new Error("Failed to fetch comments");
        }
      } catch (error) {
        console.error(error);
        setError("Failed to fetch comments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [recipeId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}comments/add/${recipeId}`,
        {
          content: newComment,
        },
        { withCredentials: true }
      );
      if (response.status === 200) {
        

        toast.success(response.data.message);
        console.log(response.data.message);
        setNewComment("");
        console.log("Nwew comment state : ", newComment);

        const updatedComments = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}comments/get-recipe-comments/${recipeId}`,
          { withCredentials: true }
        );
        console.log("Updated Comments:", updatedComments.data.result);
        setComments(updatedComments.data.result);
      }
    } catch (error) {
      console.error("Error adding comment:", error); 
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      setIsSubmitting(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}comments/delete/${commentId}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast.success(response.data.message);
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== commentId)
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log("Error deleting comment : ", error);
      toast.error("Failed to delete comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">Loading comments...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600">{error}</p>;
  }

  return (
    <div className="mt-8">
      {/* Comment Input Box */}
      <div className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          rows={3}
        />
        <button
          onClick={handleSubmitComment}
          disabled={isSubmitting}
          className={`mt-2 bg-gradient-to-r from-orange-400 to-yellow-500 text-white px-6 py-2 rounded-lg hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 font-semibold shadow-md cursor-pointer ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit Comment"}
        </button>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments?.length > 0 ? (
          comments?.map((comment) => (
            <div
              key={comment.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {storedUserId === comment.user_id && (
                  <button
                    className="cursor-pointer transition-all hover:shadow-2xl duration-200 hover:text-orange-600 hover:scale-110 backface-hidden"
                    onClick={() => handleDelete(comment.id)} // Pass the comment ID to handleDelete
                    disabled={isSubmitting}
                  >
                    <MdOutlineDeleteSweep size={25} />
                  </button>
                )}
              </div>
              <p className="mt-2 text-gray-700">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">No comments yet.</p>
        )}
      </div>
    </div>
  );
}

export default CommentComponent;
