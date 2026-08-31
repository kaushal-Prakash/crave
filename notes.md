# 🍳 The Ultimate Crave AI Guide: How Recommendations & RAG Work

> **A Complete, Step-by-Step, In-Depth Explanation**
> *Designed with intuitive real-world analogies, visual diagrams, and code-level breakdowns.*

---

## 📑 Table of Contents
1. [Architecture Overview: The Big Picture](#1-architecture-overview-the-big-picture)
2. [Module 1: Data Cleaning & Preprocessing (`text_cleaner.py`)](#2-module-1-data-cleaning--preprocessing-text_cleanerpy)
3. [Module 2: Database Ingestion & Feature Engineering (`db.py`)](#3-module-2-database-ingestion--feature-engineering-dbpy)
4. [Module 3: The Math of TF-IDF Vectorization (`vectorizer.py`)](#4-module-3-the-math-of-tf-idf-vectorization-vectorizerpy)
5. [Module 4: Similarity Scoring, Penalties & Bonuses (`similarity.py`)](#5-module-4-similarity-scoring-penalties--bonuses-similaritypy)
6. [Module 5: The Recommendation Strategies (`recommender.py`)](#6-module-5-the-recommendation-strategies-recommenderpy)
7. [Module 6: RAG Chatbot Assistant (`chatbot.py`)](#7-module-6-rag-chatbot-assistant-chatbotpy)
8. [Module 7: API & Lifecycle Management (`main.py`)](#8-module-7-api--lifecycle-management-mainpy)
9. [Quick Reference Cheat Sheet](#9-quick-reference-cheat-sheet)

---

# 1. Architecture Overview: The Big Picture

Crave’s AI engine is divided into two distinct, high-performance systems:

```
                                  ┌─────────────────────────────────────────────────────────┐
                                  │                     MySQL DATABASE                      │
                                  │  - recipes (id, title, description, user_id, date)      │
                                  │  - comments (content, recipe_id)                        │
                                  └───────────────────────────┬─────────────────────────────┘
                                                              │
                                            load_recipes() in db.py
                                                              │
                                 ┌────────────────────────────┴────────────────────────────┐
                                 │                                                         │
                                 ▼                                                         ▼
            ┌─────────────────────────────────────────┐               ┌────────────────────────────────────────┐
            │       SYSTEM A: RECOMMENDATION ENGINE   │               │          SYSTEM B: RAG CHATBOT         │
            ├─────────────────────────────────────────┤               ├────────────────────────────────────────┤
            │  1. text_cleaner.py (Sanitize text)     │               │  1. Google Gemini Embeddings           │
            │  2. vectorizer.py (TF-IDF Matrix)       │               │  2. Chroma Vector Database             │
            │  3. similarity.py (Cosine + Boosts)     │               │  3. LangChain RAG Pipeline             │
            │  4. recommender.py (Item & User Match)  │               │  4. Gemini 3.6 Flash LLM               │
            └─────────────────────────────────────────┘               └────────────────────────────────────────┘
```

---

# 2. Module 1: Data Cleaning & Preprocessing (`text_cleaner.py`)

### 🎯 Goal:
Transform messy, raw user submissions (with HTML tags, emojis, and weird punctuation) into uniform, machine-readable text tokens.

### 👶 The Analogy: "The Washing Machine"
Imagine picking muddy vegetables from a garden with plastic tags and stickers attached. Before you cook, you wash off the mud, peel off the stickers, and chop them evenly. That’s what `clean_html()` does to words!

```
Input:  "<h1>Best Pizza! 🍕🍕</h1> Check out this crispy, cheesy crust... 10/10!"
Output: "best pizza check out this crispy cheesy crust 10 10"
```

### 🔬 Code Deep-Dive:
```python
def clean_html(text):
    if not text:
        return ""

    # 1. Parse and strip HTML tags using BeautifulSoup
    soup = BeautifulSoup(text, "html.parser")
    text = soup.get_text(separator=" ")

    # 2. Strip emojis, punctuation, symbols (keep a-z, A-Z, 0-9, and whitespace)
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)

    # 3. Collapse multiple whitespace/newline blocks into a single space
    text = re.sub(r"\s+", " ", text)

    # 4. Lowercase and trim leading/trailing edges
    return text.lower().strip()
```

### Why every step matters:
- **`BeautifulSoup(..., "html.parser")`**: Removes hidden HTML tags like `<script>`, `<p>`, `<br>`, preserving the inner text.
- **`re.sub(r"[^a-zA-Z0-9\s]", " ", text)`**: Emojis (🍕) and symbols (`!@#$`) add noise to TF-IDF. Replacing them with spaces prevents words from accidentally gluing together.
- **`text.lower()`**: Ensures `"Pizza"` and `"pizza"` are recognized as the exact same culinary entity.

---

# 3. Module 2: Database Ingestion & Feature Engineering (`db.py`)

### 🎯 Goal:
Extract recipes and comments from MySQL, and assemble a single **"Feature Blob"** for every recipe.

### 🔬 The Secret Trick: Title Weight Multiplication ($3\times$)
In culinary text, the **title** is usually the most informative signal. A recipe called *"Spicy Paneer Tikka"* is much more clearly defined by its title than by 3 paragraphs of instructions.

In `db.py`:
```python
# We repeat the title 3 times
weighted_title = (r["title"] + " ") * 3

# Combine title (3x) + description + all user comments
r["features"] = clean_html(
    weighted_title +
    r["description"] + " " +
    " ".join([c["content"] for c in comments])
)
```

**Why this works:**
If the title is *"Butter Chicken"*, the words *"butter"* and *"chicken"* appear at least 3 times more frequently in the document. This artificially boosts their Term Frequency (TF), ensuring the algorithm considers them 3 times more important than casual words in the description.



# 4. Module 3: The Math of TF-IDF Vectorization (`vectorizer.py`)

### 🎯 Goal:
Convert sentences into mathematical vectors (lists of numbers) that represent how unique and meaningful each word is.

### 👶 The Analogy: "The Rarity Scale"
If someone says *"the"*, you don't care (everyone says *"the"*).
If someone says *"saffron"*, you pay close attention because *"saffron"* is rare and specific.
**TF-IDF gives low points to boring common words, and huge points to rare, special flavor words.**

---

### 📐 The Mathematical Formula:

$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \text{IDF}(t, D)$$

1. **Term Frequency ($\text{TF}$)**: How many times word $t$ appears in recipe $d$.
   - Crave uses **Sublinear TF** (`sublinear_tf=True`):
     $$\text{TF} = 1 + \log(\text{count})$$
     *Why?* A word appearing 20 times is important, but not 20 times more important than a word appearing once. Logarithms dampen repetitive spam.

2. **Inverse Document Frequency ($\text{IDF}$)**: How rare word $t$ is across all $N$ recipes in database $D$:
   $$\text{IDF}(t) = \log\left(\frac{1 + N}{1 + \text{count}(t \in D)}\right) + 1$$
   - If a word appears in almost all recipes $\rightarrow \text{IDF} \approx 0$.
   - If a word appears in only 1 recipe $\rightarrow \text{IDF}$ is very large.

---

### ⚙️ Vectorizer Configuration Explained:
```python
vectorizer = TfidfVectorizer(
    stop_words="english",    # Strips "is", "at", "which", "and"
    max_features=8000,       # Keeps only the top 8,000 most meaningful tokens
    ngram_range=(1, 2),      # Learns single words ("chicken") AND 2-word phrases ("butter chicken")
    sublinear_tf=True,       # Uses 1 + log(tf)
    min_df=1,                # Keeps rare ingredients (e.g. "truffle") even if in only 1 recipe
    max_df=0.95,             # Drops words appearing in >95% of all recipes (e.g. "delicious")
)
```

**Output:** A giant SciPy sparse matrix `vectors` of shape `(n_recipes, 8000)`.

---

# 5. Module 4: Similarity Scoring, Penalties & Bonuses (`similarity.py`)

### 🎯 Goal:
Find the most similar recipes to a query vector using **Cosine Similarity**, then adjust the scores with real-world business logic (freshness vs. viral dominance).

---

### 🧭 1. Cosine Similarity Math:
Cosine similarity measures the angle $\theta$ between two vectors:

$$\text{Cosine Similarity}(\vec{A}, \vec{B}) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|} = \cos(\theta)$$

```
  Vector A (Chocolate Brownie)
       ▲      ▲ Vector B (Chocolate Cake)
       │     /
       │    /   Angle θ is small (~0°) -> Cosine ≈ 1.0 (Very Similar!)
       │   /
       │  /
       │ /
       └────────────────────────► Vector C (Spicy Mutton Curry)
                                   Angle θ is 90° -> Cosine ≈ 0.0 (Not Similar!)
```

---

### ⚖️ 2. Business Adjustments (Penalties & Bonuses):

#### A. Popularity Dampening (Preventing Viral Monopoly):
If a recipe has 5,000 favorites, we don't want it to dominate every single recommendation on the website.
```python
popularity = r.get("favorite_count", 0) or 0
scores[i] *= max(0.0, 1.0 - 0.15 * np.log1p(popularity))
```
- `np.log1p(popularity)` computes $\log(1 + \text{favorites})$.
- Applies a gentle, smooth penalty so high-quality, lesser-known recipes can surface.

#### B. Recency Boost (Freshness Bonus):
New recipes uploaded recently get a temporary score boost up to **+10%**:
```python
age_days = (now - dt).days
recency_bonus = max(0.0, 0.10 * (1.0 - age_days / 30.0))
scores[i] += recency_bonus
```
- 0 days old (today): $+0.10$ bonus ($+10\%$).
- 15 days old: $+0.05$ bonus ($+5\%$).
- 30+ days old: $+0.00$ bonus ($0\%$).

---

# 6. Module 5: The Recommendation Strategies (`recommender.py`)

Crave provides a content-based recommendation mode:

### 📌 Strategy 1: Content-Based Item Similarity (`get_similar_recipes`)
Used on the **Recipe Details Page** (*"Because you are looking at Recipe X..."*).

1. Take the database ID `recipe_id`.
2. Find its row in memory: `idx = _recipe_index(recipe_id)`.
3. Extract its TF-IDF vector: `query_vec = vectors[idx]`.
4. Calculate similarity against all other recipes using `find_similar()`.
5. Over-fetch $3\times$ (`top_k * 3`) to allow filtering out the author's own recipes.
6. Return the top 6 closest recipes.



# 7. Module 6: RAG Chatbot Assistant (`chatbot.py`)

### 🎯 Goal:
Provide an interactive AI chef assistant that answers culinary questions using **strictly the recipes hosted in Crave's database**.

---

### 💡 Why RAG (Retrieval-Augmented Generation)?
- Standard Large Language Models (LLMs) don't know what recipes exist in your private MySQL database.
- If you ask an LLM *"What pasta can I make on Crave?"*, it would hallucinate generic recipes.
- **RAG solves this by working like an Open-Book Exam:**
  1. **Retrieve:** Find the exact relevant recipes from Crave.
  2. **Augment:** Stuff those recipes into the LLM prompt as context.
  3. **Generate:** Let the LLM write a conversational answer based on that verified context.

---

### 🔄 The Complete RAG Flow:

```
 User Prompt: "I have chicken and heavy cream, what can I cook?"
                           │
                           ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ 1. Google Gemini Embeddings (models/gemini-embedding-2)      │
 │    Converts user question into a 768-dimensional vector     │
 └─────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ 2. ChromaDB Vector Store (Local Persistent Index)           │
 │    Performs fast Approximate Nearest Neighbor (ANN) search  │
 │    Retrieves Top 5 matching Crave Recipe Documents          │
 └─────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ 3. LangChain Prompt Assembly                                │
 │    - System Prompt (Culinary Assistant persona)             │
 │    - Retrieved Context (Top 5 Crave recipes)                │
 │    - Conversation History (Human & AI messages)             │
 │    - User Question                                          │
 └─────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ 4. Google Gemini 3.6 Flash (LLM)                            │
 │    Generates friendly, context-accurate recommendation      │
 └─────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
 Final Response: "Based on Crave's community recipes, you can make Creamy Garlic Butter Chicken..."
```

---

### 📦 Key Components of `chatbot.py`:

1. **Document Representation:**
   ```python
   content = f"Title: {r['title']}\nDescription: {r['description']}\nFeatures: {r.get('features', '')}"
   doc = Document(page_content=content, metadata={"id": r["id"], "title": r["title"]})
   ```
2. **Embedding Model:** `GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-2")`.
3. **Vector Database:** `Chroma` stored locally at `chroma_db/`.
4. **LangChain LCEL Pipeline:**
   ```python
   rag_chain = (
       RunnablePassthrough.assign(context=(lambda x: format_docs(retriever.invoke(x["input"]))))
       | prompt
       | llm
       | StrOutputParser()
   )
   ```
5. **Multi-Turn Memory Support:** Accepts previous user and AI messages (`chat_history`) so users can ask follow-ups like *"Can you substitute the cream for milk?"*.

---

# 8. Module 7: API & Lifecycle Management (`main.py`)

FastAPI exposes the microservice to Next.js and external clients:

### 🚀 Application Lifespan:
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initializes ChromaDB and LangChain RAG pipeline
    init_chatbot()
    yield
    # Shutdown
```

### 🌐 Endpoints Summary:

| `/similar/{recipe_id}` | `GET` | Content-based recommendations similar to a specific recipe |
| `/chat` | `POST` | Natural language culinary assistant powered by RAG |
| `/reload` | `POST` | Rebuilds TF-IDF matrices & ChromaDB without restarting the server |

---

# 9. Quick Reference Cheat Sheet

| Concept | What it is | Where it lives | Why it is used |
|---|---|---|---|
| **Text Cleaning** | BeautifulSoup + Regex | `text_cleaner.py` | Removes HTML, emojis & punctuation noise |
| **Title Weighting** | Multiply Title $\times 3$ | `db.py` | Gives maximum importance to recipe names |
| **TF-IDF Matrix** | Term Frequency - Inverse Doc Frequency | `vectorizer.py` | Mathematical representation of culinary features |
| **Cosine Similarity** | Angular distance between vectors | `similarity.py` | Finds twin recipes based on flavor text |
| **Popularity Dampening** | $1.0 - 0.15 \times \log(1 + \text{favs})$ | `similarity.py` | Prevents viral recipes from clogging recommendations |
| **Recency Boost** | Up to $+10\%$ bonus for $<30$ days old | `similarity.py` | Surfacing fresh new community creations |
| **ChromaDB** | Local Vector Database | `chatbot.py` | High-speed semantic similarity retrieval |
| **Gemini 3.6 Flash** | Large Language Model | `chatbot.py` | Conversational response generation |
| **Hot Reload** | `POST /reload` | `main.py` | Instant index update after bulk recipe changes |

---

*Written for the Crave Platform Engine.*
