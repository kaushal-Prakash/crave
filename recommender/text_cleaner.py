from bs4 import BeautifulSoup
import re

def clean_html(text):
    soup = BeautifulSoup(text, "html.parser")
    text = soup.get_text(separator=" ")

    # remove emojis & special chars
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text)

    return text.lower().strip()
