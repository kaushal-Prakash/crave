"use client";
/* eslint-disable */
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import {
  MdOutlinePushPin,
  MdClose,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { recipe } from "@/types/types";
import CommentComponent from "@/components/Comments";

function RecipeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<recipe>();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchRecipeAndImages = async () => {
      try {
        const [recipeRes, imageRes] = await Promise.all([
          axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}recipes/get-recipe-by-id`,
            { id },
            { withCredentials: true }
          ),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}images/${id}`, {
            withCredentials: true,
          }),
        ]);

        if (recipeRes.status === 200) {
          setRecipe(recipeRes.data[0]);
        } else {
          throw new Error("Recipe fetch failed");
        }

        if (imageRes.status === 200) {
          const urls = imageRes.data.images.map(
            (img: any) =>
              `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "")}${
                img.image_url
              }`
          );
          setImages(urls);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load recipe or images.");
        toast.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeAndImages();
  }, [id]);

  const handlePinClick = () => {
    console.log("Recipe pinned!");
    toast.success("Recipe pinned!");
  };

  const handleBack = () => {
    router.back();
  };

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
  };

  const closeImageModal = () => {
    setSelectedImageIndex(null);
    document.body.style.overflow = "auto"; // Re-enable scrolling
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImageIndex === null) return;

    if (direction === "prev") {
      setSelectedImageIndex((prev) =>
        prev === 0 ? images.length - 1 : (prev || 0) - 1
      );
    } else {
      setSelectedImageIndex((prev) => ((prev || 0) + 1) % images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-orange-100 to-yellow-100">
        <p className="text-2xl font-bold text-orange-700">Loading...</p>
      </div>
    );
  }

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

        {/* Recipe Images */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {images.map((url, index) => (
              <div
                key={index}
                className="relative group cursor-pointer"
                onClick={() => openImageModal(index)}
              >
                <img
                  src={url}
                  alt={`Recipe image ${index + 1}`}
                  className="w-full h-60 object-cover rounded-xl shadow transition-transform group-hover:scale-105 z-50"
                />
                
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="bg-gradient-to-r from-orange-400 to-yellow-500 text-white px-6 py-2 rounded-lg hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 font-semibold shadow-md cursor-pointer"
        >
          Back to Last Page
        </button>
      </div>

      {/* Image Modal */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 text-white text-4xl hover:text-orange-400 transition-colors z-50"
          >
            <MdClose size={40} />
          </button>

          <button
            onClick={() => navigateImage("prev")}
            className="absolute left-4 text-white text-4xl hover:text-orange-400 transition-colors z-50"
          >
            <MdChevronLeft size={50} />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={images[selectedImageIndex]}
              alt={`Recipe image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <button
            onClick={() => navigateImage("next")}
            className="absolute right-4 text-white text-4xl hover:text-orange-400 transition-colors z-50"
          >
            <MdChevronRight size={50} />
          </button>

          <div className="absolute bottom-4 text-white text-lg z-50">
            {selectedImageIndex + 1} / {images.length}
          </div>
        </div>
      )}

      <CommentComponent recipeId={Number(id)} />
    </div>
  );
}

export default RecipeDetailPage;
