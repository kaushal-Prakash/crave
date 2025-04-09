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
  const [images, setImages] = useState<File[]>([]);
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && quillRef.current) {
      import("quill").then(({ default: Quill }) => {
        if (!quillInstance.current && quillRef.current) {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      // Validate file types and sizes
      const validFiles = selectedFiles.filter(file => 
        file.type.match('image.*') && file.size <= 5 * 1024 * 1024 // 5MB
      );
      
      if (validFiles.length !== selectedFiles.length) {
        toast.warning("Some files were skipped (only images under 5MB allowed)");
      }
      
      setImages(prev => [...prev, ...validFiles]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Create recipe first
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}users/add-recipe`,
        { title, description },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const recipe_id = response.data.recipeId;
        toast.success("Recipe created successfully!");

        // Upload images if any
        if (images.length > 0) {
          const uploadPromises = images.map(async (image) => {
            const formData = new FormData();
            formData.append("recipe_id", recipe_id.toString());
            formData.append("image", image); 
            return axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}upload`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
              }
            );
          });

          await Promise.all(uploadPromises);
          toast.success("Images uploaded successfully!");
        }

        router.push("/home");
      }
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "An error occurred while adding the recipe.";
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      
      toast.error(errorMessage);
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
              Title <span className="text-red-500">*</span>
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
              Description <span className="text-red-500">*</span>
            </label>
            <div
              ref={quillRef}
              className="bg-white rounded-lg border-2 border-orange-200"
              style={{ height: "300px" }}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-lg font-semibold text-green-700 mb-2">
              Upload Images (Optional)
            </label>
            <div className="relative w-full border-2 border-dashed border-orange-300 p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-all text-center">
              <input
                type="file"
                multiple
                accept="image/jpeg, image/png, image/jpg"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <p className="text-orange-500 font-medium">
                Drag and drop or click to select images
              </p>
              {images.length > 0 && (
                <p className="mt-2 text-green-600 text-sm">
                  {images.length} image(s) selected
                </p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Max 5MB per image (JPEG, PNG, JPG)
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1.5 active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Add Recipe & Upload Images"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddRecipePage;