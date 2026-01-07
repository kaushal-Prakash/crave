from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def find_similar(vectors, index, recipes, top_k=6):
    # Take the recipe’s position in AI space
    query_vec = vectors[index]

    # Compute cosine similarity with all recipes
    scores = cosine_similarity(query_vec, vectors)[0]

    # Penalize overly popular recipes (prevents showing only famous ones)
    for i, r in enumerate(recipes):
        popularity = r.get("favorite_count", 1)
        scores[i] = scores[i] / (1 + np.log(1 + popularity))

    # Rank by similarity score
    ranked_indices = np.argsort(scores)[::-1]

    # Skip self, return top_k
    return [i for i in ranked_indices if i != index][:top_k]
