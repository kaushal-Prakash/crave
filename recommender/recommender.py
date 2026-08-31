import numpy as np
from db import load_recipes
from vectorizer import build_vectors
from similarity import find_similar

# ---------------------------------------------------------------------------
# Global state — loaded once at startup, reloadable via reload_data()
# ---------------------------------------------------------------------------
recipes = []
vectors = None
vectorizer = None

def reload_data():
    """
    Synchronizes the in-memory cache with the database.
    Reloads all recipes, user favorites, and recalculates the TF-IDF feature matrix.
    """
    global recipes, vectors, vectorizer
    recipes = load_recipes()
    vectors, vectorizer = build_vectors(recipes)
    print(f"[recommender] Loaded {len(recipes)} recipes.")

# Perform initial data load on module import
reload_data()

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------
def _recipe_index(recipe_id: int):
    """Finds the matrix/list index of a recipe by its database ID."""
    for i, r in enumerate(recipes):
        if r["id"] == int(recipe_id):
            return i
    return None

# ---------------------------------------------------------------------------
# Content-based recommendation: Similar to a specific recipe
# ---------------------------------------------------------------------------
def get_similar_recipes(recipe_id: int, top_k: int = 6, exclude_user_id: int | None = None):
    """
    Finds recipes most similar to a target recipe using cosine similarity on TF-IDF vectors.

    Args:
        recipe_id (int): ID of the reference recipe.
        top_k (int): Maximum number of recommendations to return.
        exclude_user_id (int | None): Optional user ID to filter out recipes created by the same user.

    Returns:
        list[dict]: Top-k similar recipe objects.
    """
    idx = _recipe_index(recipe_id)
    if idx is None:
        return []

    query_vec = vectors[idx]  # Sparse row corresponding to the target recipe

    # Retrieve candidate indices sorted by cosine similarity (over-fetch to allow post-filtering)
    candidates = find_similar(vectors, query_vec, recipes, top_k * 3, exclude_index=idx)

    results = []
    for i in candidates:
        # Exclude recipes authored by the specified user if requested
        if exclude_user_id is None or recipes[i].get("user_id") != exclude_user_id:
            results.append(recipes[i])
        if len(results) >= top_k:
            break

    return results


