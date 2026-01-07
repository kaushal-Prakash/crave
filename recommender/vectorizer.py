from sklearn.feature_extraction.text import TfidfVectorizer

def build_vectors(recipes):
    corpus = [r["features"] for r in recipes]

    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=5000,
        ngram_range=(1, 2)   # learns "butter masala", "chicken curry"
    )

    vectors = vectorizer.fit_transform(corpus)
    return vectors, vectorizer
