"""Word2Vec Embedding Training and Analysis for ShieldText.

Implements CBOW and Skip-Gram models, semantic similarity, word analogies,
PCA/t-SNE dimensionality reduction for visualization, and embedding classification benchmark.
"""

import json
import logging
import os
import time
from typing import Dict, Any, List
from gensim.models import Word2Vec
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.linear_model import LogisticRegression
from sklearn.manifold import TSNE

from backend.evaluation.metrics import compute_metrics, save_metrics

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "saved_models")


def get_document_embedding(tokens: List[str], model: Word2Vec, dim: int = 100) -> np.ndarray:
    """Calculate average document vector from constituent word vectors."""
    vectors = [model.wv[w] for w in tokens if w in model.wv]
    if len(vectors) == 0:
        return np.zeros(dim, dtype=np.float32)
    return np.mean(vectors, axis=0)


def compute_tsne_pca_coords(
    model: Word2Vec, words: List[str]
) -> List[Dict[str, Any]]:
    """Compute 2D coordinates using PCA and t-SNE for embedding exploration."""
    valid_words = [w for w in words if w in model.wv]
    if len(valid_words) < 5:
        return []

    vectors = np.array([model.wv[w] for w in valid_words])

    # PCA 2D
    pca = PCA(n_components=2, random_state=42)
    pca_coords = pca.fit_transform(vectors)

    # t-SNE 2D
    perplexity = min(30, max(5, len(valid_words) - 1))
    tsne = TSNE(n_components=2, perplexity=perplexity, random_state=42, max_iter=1000)
    tsne_coords = tsne.fit_transform(vectors)

    result = []
    for i, w in enumerate(valid_words):
        result.append(
            {
                "word": w,
                "pca_x": round(float(pca_coords[i, 0]), 4),
                "pca_y": round(float(pca_coords[i, 1]), 4),
                "tsne_x": round(float(tsne_coords[i, 0]), 4),
                "tsne_y": round(float(tsne_coords[i, 1]), 4),
            }
        )
    return result


def train_word2vec_suite(vector_size: int = 100, epochs: int = 10) -> Dict[str, Any]:
    """Train both CBOW and Skip-Gram Word2Vec models, compare them, and save embeddings."""
    os.makedirs(MODELS_DIR, exist_ok=True)

    train_df = pd.read_csv(os.path.join(DATA_DIR, "train.csv"))
    test_df = pd.read_csv(os.path.join(DATA_DIR, "test.csv"))

    with open(os.path.join(DATA_DIR, "label_mapping.json"), "r") as f:
        mapping = json.load(f)
    id2label = {int(k): v for k, v in mapping["id2label"].items()}
    class_names = [id2label[i] for i in range(len(id2label))]

    train_sentences = [str(text).split() for text in train_df["clean_text"]]
    test_sentences = [str(text).split() for text in test_df["clean_text"]]

    # 1. Train CBOW (sg=0)
    logger.info("Training Word2Vec CBOW (sg=0)...")
    start_cbow = time.time()
    cbow_model = Word2Vec(
        sentences=train_sentences,
        vector_size=vector_size,
        window=5,
        min_count=2,
        sg=0,
        workers=4,
        epochs=epochs,
        seed=42,
    )
    cbow_time = round(time.time() - start_cbow, 2)
    logger.info("CBOW training completed in %.2f seconds (Vocab size: %d)", cbow_time, len(cbow_model.wv))

    # 2. Train Skip-Gram (sg=1)
    logger.info("Training Word2Vec Skip-Gram (sg=1)...")
    start_sg = time.time()
    sg_model = Word2Vec(
        sentences=train_sentences,
        vector_size=vector_size,
        window=5,
        min_count=2,
        sg=1,
        workers=4,
        epochs=epochs,
        seed=42,
    )
    sg_time = round(time.time() - start_sg, 2)
    logger.info("Skip-Gram training completed in %.2f seconds (Vocab size: %d)", sg_time, len(sg_model.wv))

    # 3. Semantic Similarity Experiments
    target_words = ["bully", "school", "hate", "friend", "threat", "people", "girl", "boy"]
    cbow_similarities = {}
    sg_similarities = {}

    for word in target_words:
        if word in cbow_model.wv:
            cbow_similarities[word] = [
                {"word": w, "similarity": round(float(sim), 4)}
                for w, sim in cbow_model.wv.most_similar(word, topn=5)
            ]
        if word in sg_model.wv:
            sg_similarities[word] = [
                {"word": w, "similarity": round(float(sim), 4)}
                for w, sim in sg_model.wv.most_similar(word, topn=5)
            ]

    # 4. Word Analogy Experiments
    # Example: school : student :: teacher : ?  or  hate : love :: attack : ?
    analogies = []
    test_analogies = [
        ("hate", "love", "attack"),  # attack - hate + love
        ("school", "student", "college"),
    ]
    for pos1, pos2, neg1 in test_analogies:
        if all(w in cbow_model.wv for w in [pos1, pos2, neg1]):
            res_cbow = cbow_model.wv.most_similar(positive=[pos2, neg1], negative=[pos1], topn=3)
            res_sg = sg_model.wv.most_similar(positive=[pos2, neg1], negative=[pos1], topn=3)
            analogies.append(
                {
                    "analogy": f"{pos1}:{neg1} :: {pos2}:?",
                    "cbow_prediction": res_cbow[0][0],
                    "cbow_score": round(float(res_cbow[0][1]), 4),
                    "sg_prediction": res_sg[0][0],
                    "sg_score": round(float(res_sg[0][1]), 4),
                }
            )

    # 5. Embedding Classification Benchmark (Logistic Regression on mean document vectors)
    logger.info("Evaluating CBOW document representations...")
    X_train_cbow = np.array([get_document_embedding(s, cbow_model, vector_size) for s in train_sentences])
    X_test_cbow = np.array([get_document_embedding(s, cbow_model, vector_size) for s in test_sentences])
    clf_cbow = LogisticRegression(max_iter=500, random_state=42)
    clf_cbow.fit(X_train_cbow, train_df["label_id"].values)
    y_pred_cbow = clf_cbow.predict(X_test_cbow)
    cbow_metrics = compute_metrics(
        test_df["label_id"].tolist(), y_pred_cbow.tolist(), class_names, "Word2Vec CBOW + Logistic Regression"
    )

    logger.info("Evaluating Skip-Gram document representations...")
    X_train_sg = np.array([get_document_embedding(s, sg_model, vector_size) for s in train_sentences])
    X_test_sg = np.array([get_document_embedding(s, sg_model, vector_size) for s in test_sentences])
    clf_sg = LogisticRegression(max_iter=500, random_state=42)
    clf_sg.fit(X_train_sg, train_df["label_id"].values)
    y_pred_sg = clf_sg.predict(X_test_sg)
    sg_metrics = compute_metrics(
        test_df["label_id"].tolist(), y_pred_sg.tolist(), class_names, "Word2Vec Skip-Gram + Logistic Regression"
    )

    # 6. Visualization Coordinates
    # Pick top frequent words across classes for 2D map
    all_words = [w for w, c in cbow_model.wv.key_to_index.items()][:120]
    cbow_vis_coords = compute_tsne_pca_coords(cbow_model, all_words)
    sg_vis_coords = compute_tsne_pca_coords(sg_model, all_words)

    # 7. Save Models and Artifacts
    logger.info("Saving Word2Vec models and visual data...")
    cbow_model.save(os.path.join(MODELS_DIR, "word2vec_cbow.model"))
    sg_model.save(os.path.join(MODELS_DIR, "word2vec_skipgram.model"))

    save_metrics(cbow_metrics, os.path.join(MODELS_DIR, "word2vec_cbow_metrics.json"))
    save_metrics(sg_metrics, os.path.join(MODELS_DIR, "word2vec_skipgram_metrics.json"))

    comparison_summary = {
        "cbow": {
            "training_time_seconds": cbow_time,
            "vocab_size": len(cbow_model.wv),
            "vector_size": vector_size,
            "accuracy": cbow_metrics["accuracy"],
            "macro_f1": cbow_metrics["f1_macro"],
            "semantic_similarities": cbow_similarities,
        },
        "skipgram": {
            "training_time_seconds": sg_time,
            "vocab_size": len(sg_model.wv),
            "vector_size": vector_size,
            "accuracy": sg_metrics["accuracy"],
            "macro_f1": sg_metrics["f1_macro"],
            "semantic_similarities": sg_similarities,
        },
        "analogies": analogies,
    }

    with open(os.path.join(MODELS_DIR, "word2vec_comparison.json"), "w", encoding="utf-8") as f:
        json.dump(comparison_summary, f, indent=2)

    with open(os.path.join(MODELS_DIR, "word2vec_visualizations.json"), "w", encoding="utf-8") as f:
        json.dump({"cbow_coords": cbow_vis_coords, "skipgram_coords": sg_vis_coords}, f, indent=2)

    logger.info("Word2Vec suite execution complete!")
    return comparison_summary


if __name__ == "__main__":
    summary = train_word2vec_suite()
    print("\n=== Word2Vec Benchmark Complete ===")
    print("CBOW Accuracy:", summary["cbow"]["accuracy"], "Macro F1:", summary["cbow"]["macro_f1"])
    print("Skip-Gram Accuracy:", summary["skipgram"]["accuracy"], "Macro F1:", summary["skipgram"]["macro_f1"])

