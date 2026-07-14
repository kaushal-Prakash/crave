from sklearn.feature_extraction.text import TfidfVectorizer

def build_vectors(recipes):
    corpus = [r["features"] for r in recipes]

    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=8000,       # increased from 5000 for richer vocabulary
        ngram_range=(1, 2),      # unigrams + bigrams (e.g. "butter chicken")
        sublinear_tf=True,       # log(1+tf) — dampens very frequent terms
        min_df=1,                # keep even rare terms (small dataset)
        max_df=0.95,             # drop near-universal terms (appear in 95%+ docs)
    )

    vectors = vectorizer.fit_transform(corpus)
    return vectors, vectorizer
