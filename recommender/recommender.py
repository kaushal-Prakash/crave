from db import load_recipes
from vectorizer import build_vectors
from similarity import find_similar

# Load recipes once at startup
recipes = load_recipes()

#vectorize all recipe features
vectors, vectorizer = build_vectors(recipes)

def get_similar_recipes(recipe_id, top_k=6):
    # Find index of recipe
    idx = next((i for i, r in enumerate(recipes) if r["id"] == int(recipe_id)), None)

    if idx is None:
        return []

    #Find nearest neighbors
    similar_indices = find_similar(vectors, idx, recipes, top_k)

    return [recipes[i] for i in similar_indices]
