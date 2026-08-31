from bs4 import BeautifulSoup
import re

def clean_html(text):
    """
    Cleans raw HTML/rich-text input for NLP preprocessing and feature extraction.
    """
    if not text:
        return ""

    # 1. Strip HTML tags and extract plain text
    soup = BeautifulSoup(text, "html.parser")
    text = soup.get_text(separator=" ")

    # 2. Remove emojis, punctuation, and special characters (keep only letters, numbers, and spaces)
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)

    # 3. Collapse multiple whitespace/newline sequences into a single space
    text = re.sub(r"\s+", " ", text)

    # 4. Convert to lowercase and trim any extra spaces at the ends
    return text.lower().strip()
