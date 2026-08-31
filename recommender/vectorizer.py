from sklearn.feature_extraction.text import TfidfVectorizer

def build_vectors(recipes):
    """
    Transforms the recipe text features into a TF-IDF sparse matrix.
    """
    # Extract text corpus(means documents) from preprocessed recipe features
    corpus = [r["features"] for r in recipes]

    vectorizer = TfidfVectorizer(
        stop_words="english",    # Ignore common English stop words
        max_features=8000,       # Cap vocabulary size to top features by frequency
        ngram_range=(1, 2),      # Include single words and 2-word phrases (e.g., "butter chicken")
        sublinear_tf=True,       # Apply sublinear scaling log(1 + tf) to dampen repetitive terms
        min_df=1,                # Retain rare terms (useful for smaller recipe datasets)
        max_df=0.95,             # Ignore terms appearing in >95% of documents (too common)
    )

    # Fit vectorizer on corpus and transform into sparse TF-IDF vectors
    vectors = vectorizer.fit_transform(corpus)
    return vectors, vectorizer
