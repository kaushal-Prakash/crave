from sklearn.metrics.pairwise import cosine_similarity

def find_similar(vectors, index, top_k=6):
    scores = cosine_similarity(vectors[index], vectors)[0]
    ranked = sorted(list(enumerate(scores)), key=lambda x: x[1], reverse=True)
    return ranked[1:top_k+1]
