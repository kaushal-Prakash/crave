"use client";
import React, { useState, useEffect } from "react";

const recipes = [
  { id: 1, name: "Spaghetti Carbonara", image: "/recipes/spaghetti.jpg" },
  { id: 2, name: "Chicken Curry", image: "/recipes/chicken-curry.jpg" },
  { id: 3, name: "Vegetable Stir Fry", image: "/recipes/stir-fry.jpg" },
  { id: 4, name: "Grilled Salmon", image: "/recipes/salmon.jpg" },
  { id: 5, name: "Pancakes", image: "/recipes/pancakes.jpg" },
  { id: 6, name: "Chocolate Cake", image: "/recipes/chocolate-cake.jpg" },
  { id: 7, name: "Caesar Salad", image: "/recipes/caesar-salad.jpg" },
  { id: 8, name: "Mushroom Risotto", image: "/recipes/risotto.jpg" },
  { id: 9, name: "Tacos", image: "/recipes/tacos.jpg" },
  { id: 10, name: "Tacos", image: "/recipes/tacos.jpg" },
  { id: 11, name: "Tacos", image: "/recipes/tacos.jpg" },
  { id: 12, name: "Tacos", image: "/recipes/tacos.jpg" },
];

const ITEMS_PER_PAGE = 10;

function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecipes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRecipes = filteredRecipes.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 min-h-screen">
        {paginatedRecipes.length > 0 ? (
          paginatedRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white p-4 rounded-lg shadow-md max-h-60"
            >
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full h-40 object-cover rounded-lg"
              />
              <h3 className="text-lg font-semibold mt-3 text-gray-800">
                {recipe.name}
              </h3>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-700">
            No recipes found
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

export default HomePage;
