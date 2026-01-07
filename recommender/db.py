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

    # Basic recipe info
    cursor.execute("""
        SELECT id, title, description FROM recipes
    """)
    recipes = cursor.fetchall()

    for r in recipes:
        # Load comments text
        cursor.execute("""
            SELECT content FROM comments WHERE recipe_id = %s
        """, (r["id"],))
        comments = cursor.fetchall()

        # Combine all text into one AI feature blob i.e a single string representing all relevant text data for the recipe
        r["features"] = clean_html(
            r["title"] + " " +
            r["description"] + " " +
            " ".join([c["content"] for c in comments])
        )

    cursor.close()
    conn.close()
    return recipes