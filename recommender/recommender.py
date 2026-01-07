# recommender.py
from db import load_recipes
from vectorizer import build_vectors
from similarity import find_similar

recipes = load_recipes()
vectors = build_vectors(recipes)

def get_similar_recipes(recipe_id):
    idx = next(i for i,r in enumerate(recipes) if r["_id"] == recipe_id)
    similar = find_similar(vectors, idx)

    return [recipes[i] for i,_ in similar]
