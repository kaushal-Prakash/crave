from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from recommender import get_similar_recipes, get_recommendations_for_user, reload_data

app = FastAPI(title="Crave Recipe Recommender", version="2.0.0")

# Allow your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/")
def home():
    return {
        "message": "Welcome to the Crave Recipe Recommender v2!",
        "server_status": "active",
        "endpoints": [
            "GET /recommend-user/{user_id}",
            "GET /similar/{recipe_id}",
            "POST /reload",
        ]
    }

# ---------------------------------------------------------------------------
# User-based recommendations (taste-profile centroid)
# ---------------------------------------------------------------------------
@app.get("/recommend-user/{user_id}")
def recommend_user(user_id: int, top_k: int = 6):
    """
    Returns recipes personalised to a user based on their authored
    and favourited recipes (centroid of all their taste signals).
    """
    results = get_recommendations_for_user(user_id, top_k=top_k)
    return results

# ---------------------------------------------------------------------------
# Content-based: similar to a specific recipe (for recipe detail pages)
# ---------------------------------------------------------------------------
@app.get("/similar/{recipe_id}")
def similar_to_recipe(recipe_id: int, top_k: int = 6, exclude_user: int | None = None):
    """
    Returns top_k recipes most similar to the given recipe.
    Optionally exclude recipes by the same author with ?exclude_user={user_id}
    """
    results = get_similar_recipes(recipe_id, top_k=top_k, exclude_user_id=exclude_user)
    if results is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return results

# ---------------------------------------------------------------------------
# Legacy endpoint — kept for backwards compatibility
# ---------------------------------------------------------------------------
@app.get("/recommend/{recipe_id}")
def recommend(recipe_id: int, top_k: int = 6):
    """Legacy: similar to a specific recipe (no user exclusion)."""
    return get_similar_recipes(recipe_id, top_k=top_k)

# ---------------------------------------------------------------------------
# Hot-reload: refresh recipe index from DB without restarting
# ---------------------------------------------------------------------------
@app.post("/reload")
def reload():
    """
    Re-fetches all recipes and favorites from the DB and rebuilds vectors.
    Call this after bulk recipe inserts/deletes.
    """
    try:
        reload_data()
        return {"status": "ok", "message": "Recipe index reloaded successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reload failed: {str(e)}")