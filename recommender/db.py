import mysql.connector
import os
from dotenv import load_dotenv
from text_cleaner import clean_html

load_dotenv()

def get_connection():
    """Establish and return a MySQL database connection using environment credentials."""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

def load_recipes():
    """
    Fetch all recipes and fill them with cleaned text features (title, description, comments).
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Fetch recipes along with aggregated favorite counts
    cursor.execute("""
        SELECT r.id, r.title, r.description, r.user_id, r.created_at,
               COUNT(f.recipe_id) AS favorite_count
        FROM recipes r
        LEFT JOIN favorites f ON f.recipe_id = r.id
        GROUP BY r.id, r.title, r.description, r.user_id, r.created_at
    """)
    recipes = cursor.fetchall()

    for r in recipes:
        # Fetch associated comments to include in the recipe's text corpus
        cursor.execute("""
            SELECT content FROM comments WHERE recipe_id = %s
        """, (r["id"],))
        comments = cursor.fetchall()

        # Weight the title higher for TF-IDF feature extraction
        weighted_title = (r["title"] + " ") * 3

        # Combine and clean text fields into a single feature string
        r["features"] = clean_html(
            weighted_title +
            r["description"] + " " +
            " ".join([c["content"] for c in comments])
        )

    cursor.close()
    conn.close()
    return recipes