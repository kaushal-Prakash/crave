from fastapi import FastAPI
from recommender import get_similar_recipes
app = FastAPI()

@app.get("/")
def home():
    return {"message" : "welcome to the recipe recommender system!",
            "server_status" : "active"}

@app.get("/recommend/{recipe_id}")
def recommend(recipe_id: int):
    return get_similar_recipes(recipe_id)