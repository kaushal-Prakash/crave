from fastapi import FastAPI
from recommender import get_similar_recipes
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

# Allow your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Next.js 
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message" : "welcome to the recipe recommender system!",
            "server_status" : "active"}

@app.get("/recommend/{recipe_id}")
def recommend(recipe_id: int):
    return get_similar_recipes(recipe_id)