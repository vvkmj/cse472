"""Export trained TF-IDF vectorizer and classifiers into a high-performance,
compact JSON format for client-side and serverless JavaScript inference.
"""

import json
import os
import joblib
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "saved_models")
NETLIFY_FUNCS_DIR = os.path.join(BASE_DIR, "netlify", "functions")
FRONTEND_NETLIFY_FUNCS_DIR = os.path.join(BASE_DIR, "frontend", "netlify", "functions")
FRONTEND_DATA_DIR = os.path.join(BASE_DIR, "frontend", "src", "data")

def export_model_engine():
    print("Loading trained models...")
    vec = joblib.load(os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib"))
    lr = joblib.load(os.path.join(MODELS_DIR, "logistic_regression.joblib"))
    svm = joblib.load(os.path.join(MODELS_DIR, "linear_svm.joblib"))

    classes = ["age", "ethnicity", "gender", "not_cyberbullying", "other_cyberbullying", "religion"]

    # Build compact dictionary: term -> [idf, lr_weights (6), svm_weights (6)]
    compact_vocab = {}
    for term, idx in vec.vocabulary_.items():
        idf_val = round(float(vec.idf_[idx]), 3)
        lr_w = [round(float(x), 3) for x in lr.coef_[:, idx]]
        svm_w = [round(float(x), 3) for x in svm.coef_[:, idx]]
        compact_vocab[term] = [idf_val, lr_w, svm_w]

    # Add high-leverage modern internet harassment terms if missing or boost safety
    critical_terms = {
        "kys": [9.5, [0.0, 0.0, 0.0, -4.5, 4.8, 0.0], [0.0, 0.0, 0.0, -3.5, 4.0, 0.0]],
        "kill yourself": [9.5, [0.0, 0.0, 0.0, -4.5, 5.0, 0.0], [0.0, 0.0, 0.0, -3.5, 4.2, 0.0]],
        "go die": [9.5, [0.0, 0.0, 0.0, -4.0, 4.5, 0.0], [0.0, 0.0, 0.0, -3.0, 3.8, 0.0]],
        "hang yourself": [9.5, [0.0, 0.0, 0.0, -4.5, 5.0, 0.0], [0.0, 0.0, 0.0, -3.5, 4.2, 0.0]],
        "subhuman": [9.5, [0.0, 2.5, 0.0, -3.5, 3.5, 0.0], [0.0, 2.0, 0.0, -2.8, 3.0, 0.0]],
        "nobody likes you": [9.5, [1.0, 0.0, 0.0, -3.5, 4.0, 0.0], [0.8, 0.0, 0.0, -2.8, 3.2, 0.0]],
    }
    for term, entry in critical_terms.items():
        if term not in compact_vocab:
            compact_vocab[term] = entry

    data = {
        "classes": classes,
        "lr_intercept": [round(float(x), 3) for x in lr.intercept_],
        "svm_intercept": [round(float(x), 3) for x in svm.intercept_],
        "vocabulary": compact_vocab,
    }

    os.makedirs(NETLIFY_FUNCS_DIR, exist_ok=True)
    os.makedirs(FRONTEND_NETLIFY_FUNCS_DIR, exist_ok=True)
    os.makedirs(FRONTEND_DATA_DIR, exist_ok=True)

    netlify_path = os.path.join(NETLIFY_FUNCS_DIR, "model_engine.json")
    frontend_netlify_path = os.path.join(FRONTEND_NETLIFY_FUNCS_DIR, "model_engine.json")
    frontend_path = os.path.join(FRONTEND_DATA_DIR, "modelEngine.json")

    for target_path in (netlify_path, frontend_netlify_path, frontend_path):
        print(f"Writing {len(compact_vocab)} features to {target_path}...")
        with open(target_path, "w", encoding="utf-8") as f:
            json.dump(data, f, separators=(",", ":"))

    size_kb = os.path.getsize(frontend_path) / 1024
    print(f"Model engine exported successfully! File size: {size_kb:.1f} KB")

if __name__ == "__main__":
    export_model_engine()

