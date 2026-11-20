"""Traditional NLP Baseline Models for ShieldText.

Implements TF-IDF / N-gram feature extraction, Logistic Regression,
Linear SVM, top feature importance analysis, and test evaluation.
"""

import json
import logging
import os
from typing import Dict, Any, List
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC

from backend.evaluation.metrics import compute_metrics, save_metrics

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "saved_models")


def extract_top_features_per_class(
    model, vectorizer: TfidfVectorizer, class_names: List[str], top_n: int = 15
) -> Dict[str, List[Dict[str, Any]]]:
    """Extract most influential positive TF-IDF features per class."""
    feature_names = vectorizer.get_feature_names_out()
    top_features = {}

    for i, class_name in enumerate(class_names):
        coef = model.coef_[i]
        top_indices = coef.argsort()[-top_n:][::-1]
        top_features[class_name] = [
            {"word": feature_names[idx], "weight": round(float(coef[idx]), 4)}
            for idx in top_indices
        ]

    return top_features


def train_baseline(quick_mode: bool = False) -> Dict[str, Any]:
    """Train and evaluate baseline Logistic Regression and Linear SVM."""
    os.makedirs(MODELS_DIR, exist_ok=True)

    train_df = pd.read_csv(os.path.join(DATA_DIR, "train.csv"))
    test_df = pd.read_csv(os.path.join(DATA_DIR, "test.csv"))

    with open(os.path.join(DATA_DIR, "label_mapping.json"), "r") as f:
        mapping = json.load(f)
    id2label = {int(k): v for k, v in mapping["id2label"].items()}
    class_names = [id2label[i] for i in range(len(id2label))]

    if quick_mode:
        logger.info("Quick mode enabled: Subsampling 5,000 train records for rapid baseline development.")
        train_df = train_df.sample(n=min(5000, len(train_df)), random_state=42).reset_index(drop=True)

    logger.info("Fitting TF-IDF Vectorizer (unigrams + bigrams, max_features=15000)...")
    vectorizer = TfidfVectorizer(
        max_features=15000,
        ngram_range=(1, 2),
        sublinear_tf=True,
    )
    X_train = vectorizer.fit_transform(train_df["clean_text"].fillna(""))
    y_train = train_df["label_id"].values

    X_test = vectorizer.transform(test_df["clean_text"].fillna(""))
    y_test = test_df["label_id"].values

    # 1. Logistic Regression
    logger.info("Training Logistic Regression classifier...")
    lr_model = LogisticRegression(max_iter=1000, C=1.0, random_state=42)
    lr_model.fit(X_train, y_train)

    y_pred_lr = lr_model.predict(X_test)
    metrics_lr = compute_metrics(
        y_test.tolist(), y_pred_lr.tolist(), class_names=class_names, model_name="Logistic Regression (TF-IDF)"
    )
    logger.info(
        "Logistic Regression Results - Acc: %.4f, Macro F1: %.4f",
        metrics_lr["accuracy"],
        metrics_lr["f1_macro"],
    )

    # 2. Linear SVM
    logger.info("Training Linear SVM classifier...")
    svm_model = LinearSVC(C=0.8, random_state=42, max_iter=2000)
    svm_model.fit(X_train, y_train)

    y_pred_svm = svm_model.predict(X_test)
    metrics_svm = compute_metrics(
        y_test.tolist(), y_pred_svm.tolist(), class_names=class_names, model_name="Linear SVM (TF-IDF)"
    )
    logger.info(
        "Linear SVM Results - Acc: %.4f, Macro F1: %.4f",
        metrics_svm["accuracy"],
        metrics_svm["f1_macro"],
    )

    # Explainability: Top features
    logger.info("Extracting top influential features per class...")
    lr_features = extract_top_features_per_class(lr_model, vectorizer, class_names)
    svm_features = extract_top_features_per_class(svm_model, vectorizer, class_names)

    # Save artifacts
    logger.info("Saving baseline artifacts to %s...", MODELS_DIR)
    joblib.dump(vectorizer, os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib"))
    joblib.dump(lr_model, os.path.join(MODELS_DIR, "logistic_regression.joblib"))
    joblib.dump(svm_model, os.path.join(MODELS_DIR, "linear_svm.joblib"))

    save_metrics(metrics_lr, os.path.join(MODELS_DIR, "logistic_regression_metrics.json"))
    save_metrics(metrics_svm, os.path.join(MODELS_DIR, "linear_svm_metrics.json"))

    with open(os.path.join(MODELS_DIR, "feature_importance.json"), "w", encoding="utf-8") as f:
        json.dump({"logistic_regression": lr_features, "linear_svm": svm_features}, f, indent=2)

    return {"logistic_regression": metrics_lr, "linear_svm": metrics_svm}


if __name__ == "__main__":
    results = train_baseline(quick_mode=False)
    print("\n=== Baseline Training Complete ===")
    print("LR Accuracy:", results["logistic_regression"]["accuracy"], "Macro F1:", results["logistic_regression"]["f1_macro"])
    print("SVM Accuracy:", results["linear_svm"]["accuracy"], "Macro F1:", results["linear_svm"]["f1_macro"])

