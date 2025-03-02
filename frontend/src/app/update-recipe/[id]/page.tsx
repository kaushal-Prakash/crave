"use client";
/* eslint-disable */
import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import "quill/dist/quill.snow.css";

function EditRecipePage() {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const quillRef = useRef(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}recipes/get-recipe-by-id`,
          { id },
          { withCredentials: true }
        );

        if (response.status === 200) {
          const recipe = response.data[0];
          setTitle(recipe.title);
          setDescription(recipe.description);

          if (quillRef.current) {
            const Quill = require("quill").default;
            const quill = new Quill(quillRef.current, {
              theme: "snow",
              placeholder: "Enter recipe description...",
            });
            
            quill.root.style.fontSize = "16px";
            quill.root.innerHTML = recipe.description; // Set the initial content
            quill.on("text-change", () => {
              setDescription(quill.root.innerHTML); // Update description state
            });
          }
        } else {
          toast.error("Failed to fetch recipe details");
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
        toast.error("Internal server error! Please try again.");
      }
    };

    fetchRecipe();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}recipes/update-recipe`,
        { id, title, description },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast.success("Recipe updated successfully!");
        router.push("/home");
      } else {
        toast.error("Failed to update recipe");
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
      toast.error("Internal server error! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-100 flex flex-col items-center justify-center p-6">
      <div className="w-full mt-16 max-w-2xl bg-white rounded-xl shadow-2xl p-6 md:p-12 border-2 border-orange-200">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent from-orange-600 to-yellow-700 mb-8">
          Edit Recipe
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-lg font-semibold text-green-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter recipe title"
              className="w-full px-4 py-2 rounded-lg border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 outline-none transition-all"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-lg font-semibold text-green-700 mb-2">
              Description
            </label>
            <div
              ref={quillRef}
              className="bg-white rounded-lg quill-custom-font" // Add custom class
              style={{ height: "300px" }} // Set height for the container
            ></div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer bg-gradient-to-r from-orange-400 to-yellow-500 text-white px-6 py-3 rounded-lg hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1.5 hover:rounded-3xl active:-translate-1"
          >
            {loading ? "Updating Recipe..." : "Update Recipe"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditRecipePage;
