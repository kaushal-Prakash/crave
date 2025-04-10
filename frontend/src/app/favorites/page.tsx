"use client";
import RecipeCard from "@/components/RecipeCard";
import { recipe } from "@/types/types";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;

function FavPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recipes, setRecipes] = useState<recipe[]>([]);
  const [refreshFavorites, setRefreshFavorites] = useState(false);

  useEffect(() => {
    const getRecipes = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}users/get-user-fav`,
          { withCredentials: true }
        );

        if (res.status === 200 || res.status === 204) {
          setRecipes(res.data.favorites);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch favorite recipes");
      }
    };

    getRecipes();
  }, [refreshFavorites]);

  const filteredRecipes = recipes?.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecipes?.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRecipes = filteredRecipes?.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleRefreshFavorites = () => {
    setRefreshFavorites((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 to-yellow-200 p-8">
      <div className="max-w-md mx-auto mb-6 pt-20">
        <input
          type="text"
          placeholder="Search recipes..."
          className="w-full p-3 border border-gray-300 rounded-3xl px-6 outline-0 bg-white font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {paginatedRecipes?.length > 0 ? (
          paginatedRecipes?.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              {...recipe} 
              onDelete={handleRefreshFavorites}
              onUpdate={handleRefreshFavorites} 
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-700">
            No favorite recipes found
          </p>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-3">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`px-4 py-2 rounded-lg font-semibold ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-orange-500 text-white hover:bg-orange-600 transition"
            }`}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-white rounded-lg shadow">{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className={`px-4 py-2 rounded-lg font-semibold ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-orange-500 text-white hover:bg-orange-600 transition"
            }`}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default FavPage;