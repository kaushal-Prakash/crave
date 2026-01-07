# vectorizer.py
from sklearn.feature_extraction.text import TfidfVectorizer

def build_vectors(recipes):
    corpus = []
    for r in recipes:
        text = " ".join(r["ingredients"]) + " " + \
               " ".join(r["tags"]) + " " + \
               r["cuisine"] + " " + \
               r["description"]
        corpus.append(text)

    vectorizer = TfidfVectorizer(stop_words="english")
    vectors = vectorizer.fit_transform(corpus)
    return vectors
