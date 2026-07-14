"use client";
import React, { useEffect, useState, useCallback } from "react";
import RecipeCard from "./RecipeCard";
import { recipe } from "@/types/types";
import axios from "axios";
import { toast } from "react-toastify";

interface RecommendedProps {
  /** Pass to get user-taste-profile recommendations */
  userId?: number;
  /** Pass to get "similar to this recipe" recommendations (takes priority) */
  recipeId?: number;
  /** Optional title override */
  title?: string;
}

// ─── Skeleton card ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-orange-100 shadow-sm animate-pulse bg-white">
      <div className="h-40 bg-gradient-to-br from-orange-100 to-yellow-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-orange-100 rounded w-3/4" />
        <div className="h-3 bg-orange-50 rounded w-full" />
        <div className="h-3 bg-orange-50 rounded w-5/6" />
        <div className="flex items-center gap-2 mt-4">
          <div className="h-6 w-6 rounded-full bg-orange-100" />
          <div className="h-3 bg-orange-100 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
function Recommended({ userId, recipeId, title }: RecommendedProps) {
  const [recommendedRecipes, setRecommendedRecipes] = useState<recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"similar" | "user" | null>(null);

  const fetchRecommendedRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response;

      if (recipeId) {
        // Priority 1: content-based similarity to this specific recipe
        response = await axios.get(
          `http://127.0.0.1:8000/similar/${recipeId}`,
          { withCredentials: true, timeout: 10000 }
        );
        setMode("similar");
      } else if (userId) {
        // Priority 2: user taste-profile centroid
        response = await axios.get(
          `http://127.0.0.1:8000/recommend-user/${userId}`,
          { withCredentials: true, timeout: 10000 }
        );
        setMode("user");
      } else {
        setLoading(false);
        return;
      }

      if (response.status === 200 && Array.isArray(response.data)) {
        setRecommendedRecipes(response.data);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err: unknown) {
      console.error("Error fetching recommendations:", err);

      let msg = "Unable to fetch recommendations";
      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED") msg = "Request timed out. Please try again.";
        else if (err.request) msg = "Recommender service is offline.";
        else if (err.response) msg = `Server error: ${err.response.status}`;
      } else if (err instanceof Error) {
        msg = err.message;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [recipeId, userId]);

  useEffect(() => {
    fetchRecommendedRecipes();
  }, [fetchRecommendedRecipes]);

  const handleDeleteRecipe = (recipeId: number) => {
    setRecommendedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-orange-100 rounded w-56 animate-pulse" />
          <div className="h-4 bg-orange-100 rounded w-20 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="text-4xl">⚠️</div>
        <p className="text-red-500 font-medium text-center">{error}</p>
        <button
          onClick={fetchRecommendedRecipes}
          className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition-colors font-semibold shadow"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Empty state ──
  if (recommendedRecipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <div className="text-5xl">🍽️</div>
        <p className="text-gray-600 font-semibold text-lg">No recommendations yet</p>
        <p className="text-gray-400 text-sm max-w-sm">
          {mode === "user"
            ? "Favourite and post more recipes to get personalised suggestions!"
            : "We couldn't find similar recipes right now."}
        </p>
      </div>
    );
  }

  // ── Results ──
  const displayTitle =
    title ??
    (mode === "similar" ? "Similar Recipes" : "Recommended For You");

  const badge =
    mode === "similar"
      ? { emoji: "🔍", label: "Content match" }
      : { emoji: "✨", label: "Your taste profile" };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-800">{displayTitle}</h2>
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
            {badge.emoji} {badge.label}
          </span>
        </div>

        <button
          onClick={fetchRecommendedRecipes}
          className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-800 font-semibold transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {recommendedRecipes.map((recipe) => (
          <RecipeCard
            key={`rec-${recipe.id}`}
            id={recipe.id}
            title={recipe.title}
            description={recipe.description}
            created_at={recipe.created_at}
            user_id={recipe.user_id}
            onDelete={() => handleDeleteRecipe(recipe.id)}
            onUpdate={fetchRecommendedRecipes}
          />
        ))}
      </div>
    </div>
  );
}

export default Recommended;