import numpy as np
from db import load_recipes
from vectorizer import build_vectors
from similarity import find_similar

# ---------------------------------------------------------------------------
# Global state — loaded once at startup, reloadable via reload_data()
# ---------------------------------------------------------------------------
recipes = []
user_favorites: dict[int, list[int]] = {}
vectors = None
vectorizer = None

def reload_data():
    """
    Synchronizes the in-memory cache with the database.
    Reloads all recipes, user favorites, and recalculates the TF-IDF feature matrix.
    """
    global recipes, user_favorites, vectors, vectorizer
    recipes, user_favorites = load_recipes()
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

# ---------------------------------------------------------------------------
# User-based recommendation: Centroid of user taste profile
# ---------------------------------------------------------------------------
def get_recommendations_for_user(user_id: int, top_k: int = 6):
    """
    Builds a personalized taste profile centroid from all recipes the user
    authored or favorited, and ranks unseen recipes against it.

    Args:
        user_id (int): ID of the target user.
        top_k (int): Number of personalized recommendations to return.

    Returns:
        list[dict]: Recommended recipes personalized for the user.
    """
    uid = int(user_id)

    # Aggregate recipe IDs that represent the user's taste preferences
    authored_ids = {r["id"] for r in recipes if r.get("user_id") == uid}
    favourited_ids = set(user_favorites.get(uid, []))
    seed_ids = authored_ids | favourited_ids

    # Cold-start fallback: For users without interaction history, return the latest community recipes
    if not seed_ids:
        other = [r for r in recipes if r.get("user_id") != uid]
        other_sorted = sorted(other, key=lambda r: str(r.get("created_at", "")), reverse=True)
        return other_sorted[:top_k]

    # Map seed recipe IDs to their corresponding matrix row indices
    id_to_idx = {r["id"]: i for i, r in enumerate(recipes)}
    seed_indices = [id_to_idx[sid] for sid in seed_ids if sid in id_to_idx]

    # Calculate the taste centroid vector (mean across all seed recipe TF-IDF vectors)
    seed_matrix = vectors[seed_indices]
    centroid = seed_matrix.mean(axis=0)

    # Exclude already interacted (seed) recipes from recommendation results
    excluded = set(seed_indices)
    candidates = find_similar(vectors, centroid, recipes, top_k * 3, exclude_index=excluded)

    # Filter out candidate recipes authored by the user to focus on new discovery
    results = []
    for i in candidates:
        if recipes[i].get("user_id") != uid:
            results.append(recipes[i])
        if len(results) >= top_k:
            break

    return results
