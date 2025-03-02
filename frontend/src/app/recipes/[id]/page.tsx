"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { MdOutlinePushPin } from "react-icons/md";
import { recipe } from "@/types/types";

function RecipeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<recipe>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}recipes/get-recipe-by-id`,
          { id },
          { withCredentials: true }
        );
        if (response.status !== 200) {
          throw new Error("Error fetching recipe");
        }
        setRecipe(response.data[0]);
        console.log(response.data[0]);
      } catch (error) {
        console.error(error);
        setError("Failed to fetch recipe. Please try again later.");
        toast.error("Failed to fetch recipe");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handlePinClick = () => {
    console.log("Recipe pinned!");
    toast.success("Recipe pinned!");
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-orange-100 to-yellow-100">
        <p className="text-2xl font-bold text-orange-700">Loading...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-orange-100 to-yellow-100">
        <p className="text-2xl font-bold text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-100 p-6">
      <div className="mt-16 mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-12 border-2 border-orange-200 relative">
        {/* Pin Button */}
        <button
          onClick={handlePinClick}
          className="absolute right-8 top-8 text-green-800 cursor-pointer hover:text-orange-800 transition-colors"
        >
          <MdOutlinePushPin size={30} />
        </button>

        {/* Recipe Title */}
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent from-orange-600 to-yellow-700 mb-6">
          {recipe?.title}
        </h1>

        {/* Recipe Description */}
        <div
          className="text-lg text-gray-700 mb-8 quill-content"
          dangerouslySetInnerHTML={{ __html: recipe?.description || "" }}
        ></div>

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="bg-gradient-to-r from-orange-400 to-yellow-500 text-white px-6 py-2 rounded-lg hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 font-semibold shadow-md cursor-pointer"
        >
          Back to Last Page
        </button>
      </div>
    </div>
  );
}

export default RecipeDetailPage;