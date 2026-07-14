from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from datetime import datetime, timezone

def find_similar(vectors, query_vec, recipes, top_k=6, exclude_index=None):
    """
    Find top_k recipes most similar to query_vec.

    Args:
        vectors:       Sparse TF-IDF matrix (n_recipes x n_features)
        query_vec:     Query vector — either a row from `vectors` or a dense centroid
        recipes:       List of recipe dicts (must have 'favorite_count', 'created_at')
        top_k:         Number of results to return
        exclude_index: Single index or list of indices to skip (e.g. source recipe)
    """
    scores = cosine_similarity(query_vec, vectors)[0].copy()

    now = datetime.now(timezone.utc)

    for i, r in enumerate(recipes):
        # --- Popularity dampening (gentle additive penalty) ---
        # Uses the real favorite_count loaded from the DB via the favorites JOIN.
        # Old code divided by (1 + log(popularity)) which was too aggressive.
        popularity = r.get("favorite_count", 0) or 0
        scores[i] *= max(0.0, 1.0 - 0.15 * np.log1p(popularity))

        # --- Recency boost ---
        # Newer recipes get a slight score bonus (up to +10% for recipes < 7 days old).
        created_at = r.get("created_at")
        if created_at:
            try:
                if hasattr(created_at, "replace"):
                    # Already a datetime object (mysql-connector returns these)
                    dt = created_at.replace(tzinfo=timezone.utc) if created_at.tzinfo is None else created_at
                else:
                    dt = datetime.fromisoformat(str(created_at)).replace(tzinfo=timezone.utc)
                age_days = (now - dt).days
                recency_bonus = max(0.0, 0.10 * (1.0 - age_days / 30.0))
                scores[i] += recency_bonus
            except Exception:
                pass  # silently skip malformed dates

    # Build exclusion set
    if exclude_index is None:
        excluded = set()
    elif isinstance(exclude_index, (list, set)):
        excluded = set(exclude_index)
    else:
        excluded = {exclude_index}

    ranked = np.argsort(scores)[::-1]
    return [i for i in ranked if i not in excluded][:top_k]
