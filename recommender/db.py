import mysql.connector
import os
from dotenv import load_dotenv
from text_cleaner import clean_html

load_dotenv()

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

def load_recipes():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Basic recipe info with real favorite counts from the favorites table
    cursor.execute("""
        SELECT r.id, r.title, r.description, r.user_id, r.created_at,
               COUNT(f.recipe_id) AS favorite_count
        FROM recipes r
        LEFT JOIN favorites f ON f.recipe_id = r.id
        GROUP BY r.id, r.title, r.description, r.user_id, r.created_at
    """)
    recipes = cursor.fetchall()

    for r in recipes:
        # Load comments text
        cursor.execute("""
            SELECT content FROM comments WHERE recipe_id = %s
        """, (r["id"],))
        comments = cursor.fetchall()

        # Repeat title 3x to give it stronger weight in TF-IDF
        weighted_title = (r["title"] + " ") * 3

        # Combine all text into one feature blob
        r["features"] = clean_html(
            weighted_title +
            r["description"] + " " +
            " ".join([c["content"] for c in comments])
        )

    # Build a lookup: user_id -> list of favorited recipe IDs
    cursor.execute("SELECT user_id, recipe_id FROM favorites")
    fav_rows = cursor.fetchall()
    user_favorites: dict[int, list[int]] = {}
    for row in fav_rows:
        uid = row["user_id"]
        rid = row["recipe_id"]
        user_favorites.setdefault(uid, []).append(rid)

    cursor.close()
    conn.close()
    return recipes, user_favorites