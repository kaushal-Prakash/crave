"use client";
import React, { useEffect, useState } from "react";
import RecipeCard from "./RecipeCard";
import { recipe } from "@/types/types";
import axios from "axios";
import { toast } from "react-toastify";

interface RecommendedProps {
  userId?: number; // Optional prop to make it reusable
}

function Recommended({ userId }: RecommendedProps) {
  const [recommendedRecipes, setRecommendedRecipes] = useState<recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    // Get current user ID from localStorage if available
    const storedUserId = localStorage.getItem("currentUserId");
    if (storedUserId) {
      setCurrentUserId(Number(storedUserId));
    }
    
    fetchRecommendedRecipes();
  }, [userId]);

  const fetchRecommendedRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use userId prop or current user ID
      const targetUserId = userId || currentUserId || 1;
      
      const response = await axios.get(
        `http://127.0.0.1:8000/recommend/${targetUserId}`,
        { 
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        }
      );

      if (response.status === 200 && response.data) {
        setRecommendedRecipes(response.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Error fetching recommended recipes:", error);
      
      let errorMessage = "Unable to fetch recommendations";
      if (error.response) {
        errorMessage = `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = (recipeId: number) => {
    setRecommendedRecipes(prevRecipes => 
      prevRecipes.filter(recipe => recipe.id !== recipeId)
    );
    toast.success("Recipe removed from recommendations");
  };

  const handleUpdateRecipe = () => {
    // Refresh recommendations after update
    fetchRecommendedRecipes();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-gray-300 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col justify-center items-center h-64 p-4 bg-red-50 rounded-lg">
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchRecommendedRecipes}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (recommendedRecipes.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-64 p-8 bg-gray-50 rounded-lg text-center">
          <div className="text-xl text-gray-600 mb-4">
            No recommendations available
          </div>
          <p className="text-gray-500 mb-6">
            Try interacting with more recipes to get personalized recommendations!
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Recommended For You
          </h2>
          <button
            onClick={fetchRecommendedRecipes}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendedRecipes.map((recipe) => (
            <RecipeCard
              key={`${recipe.id}-${recipe.title}`}
              id={recipe.id}
              title={recipe.title}
              description={recipe.description}
              created_at={recipe.created_at}
              user_id={recipe.user_id}
              onDelete={() => handleDeleteRecipe(recipe.id)}
              onUpdate={handleUpdateRecipe}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="recommended-container p-4 md:p-6">
      {renderContent()}
    </div>
  );
}

export default Recommended;