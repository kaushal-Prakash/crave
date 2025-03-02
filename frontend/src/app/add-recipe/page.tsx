"use client";
/* eslint-disable */
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import "quill/dist/quill.snow.css";

function AddRecipePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const quillRef = useRef<HTMLDivElement>(null); 
  const quillInstance = useRef<any>(null); 

  useEffect(() => {
    if (typeof window !== "undefined" && quillRef.current) {
      import("quill").then(({ default: Quill }) => {
        if (!quillInstance.current && quillRef.current) {null
          quillInstance.current = new Quill(quillRef.current, {
            theme: "snow",
            placeholder: "Enter recipe description...",
          });

          quillInstance.current.root.style.height = "300px";
          quillInstance.current.root.style.fontSize = "16px";

          quillInstance.current.on("text-change", () => {
            setDescription(quillInstance.current.root.innerHTML);
          });
        }
      });
    }

    return () => {
      if (quillInstance.current) {
        quillInstance.current.off("text-change");
        quillInstance.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}users/add-recipe`,
        { title, description },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast.success("Recipe added successfully!");
        router.push("/home");
      } else {
        toast.error("Failed to add recipe");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while adding the recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-100 flex flex-col items-center justify-center p-6">
      <div className="w-full mt-16 max-w-2xl bg-white rounded-xl shadow-2xl p-6 md:p-12 border-2 border-orange-200">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent from-orange-600 to-yellow-700 mb-8">
          Add a New Recipe
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
              className="bg-white rounded-lg quill-custom-font"
              style={{ height: "300px" }}
            ></div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer bg-gradient-to-r from-orange-400 to-yellow-500 text-white px-6 py-3 rounded-lg hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1.5 hover:rounded-3xl active:-translate-1"
          >
            {loading ? "Adding Recipe..." : "Add Recipe"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddRecipePage;
