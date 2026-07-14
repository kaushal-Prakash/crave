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
    """Re-fetch all recipes and favorites from the DB and rebuild vectors."""
    global recipes, user_favorites, vectors, vectorizer
    recipes, user_favorites = load_recipes()
    vectors, vectorizer = build_vectors(recipes)
    print(f"[recommender] Loaded {len(recipes)} recipes.")

# Initial load
reload_data()

# ---------------------------------------------------------------------------
# ID → index helper
# ---------------------------------------------------------------------------
def _recipe_index(recipe_id: int):
    return next((i for i, r in enumerate(recipes) if r["id"] == int(recipe_id)), None)

# ---------------------------------------------------------------------------
# Content-based: similar to a specific recipe
# ---------------------------------------------------------------------------
def get_similar_recipes(recipe_id: int, top_k: int = 6, exclude_user_id: int | None = None):
    """Return top_k recipes most similar to the given recipe."""
    idx = _recipe_index(recipe_id)
    if idx is None:
        return []

    query_vec = vectors[idx]  # sparse row from TF-IDF matrix

    # Fetch more than needed so we have room to filter
    candidates = find_similar(vectors, query_vec, recipes, top_k * 3, exclude_index=idx)

    results = []
    for i in candidates:
        if exclude_user_id is None or recipes[i].get("user_id") != exclude_user_id:
            results.append(recipes[i])
        if len(results) >= top_k:
            break

    return results

# ---------------------------------------------------------------------------
# User-based: centroid of all recipes the user authored OR favourited
# ---------------------------------------------------------------------------
def get_recommendations_for_user(user_id: int, top_k: int = 6):
    """
    Build a taste-profile centroid from every recipe the user has authored
    or favourited, then rank all other recipes against it.
    """
    uid = int(user_id)

    # Collect authored recipe indices
    authored_ids = {r["id"] for r in recipes if r.get("user_id") == uid}

    # Collect favourited recipe indices (from user_favorites lookup)
    favourited_ids = set(user_favorites.get(uid, []))

    # Union of both — the user's taste footprint
    seed_ids = authored_ids | favourited_ids

    if not seed_ids:
        # Cold-start: return most recently added recipes from other users
        other = [r for r in recipes if r.get("user_id") != uid]
        other_sorted = sorted(other, key=lambda r: str(r.get("created_at", "")), reverse=True)
        return other_sorted[:top_k]

    # Build seed indices (only those that exist in our recipe list)
    id_to_idx = {r["id"]: i for i, r in enumerate(recipes)}
    seed_indices = [id_to_idx[sid] for sid in seed_ids if sid in id_to_idx]

    # Compute centroid of seed vectors (mean in TF-IDF space)
    seed_matrix = vectors[seed_indices]          # sparse sub-matrix
    centroid = seed_matrix.mean(axis=0)          # (1 x n_features) dense matrix

    # Exclude all seed recipes from results
    excluded = set(seed_indices)

    candidates = find_similar(vectors, centroid, recipes, top_k * 3, exclude_index=excluded)

    # Also exclude any recipes by the same user that weren't in the seed set
    results = []
    for i in candidates:
        if recipes[i].get("user_id") != uid:
            results.append(recipes[i])
        if len(results) >= top_k:
            break

    return results
