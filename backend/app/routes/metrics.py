"""Model comparison and performance metrics endpoints."""

import json
import os
from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["Evaluation Metrics"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "saved_models")

METRIC_FILES = {
    "logistic_regression": ("Logistic Regression (TF-IDF)", "logistic_regression_metrics.json"),
    "linear_svm": ("Linear SVM (TF-IDF)", "linear_svm_metrics.json"),
    "word2vec_cbow": ("Word2Vec CBOW + Classifier", "word2vec_cbow_metrics.json"),
    "word2vec_skipgram": ("Word2Vec Skip-Gram + Classifier", "word2vec_skipgram_metrics.json"),
    "lstm": ("LSTM (Unidirectional)", "lstm_metrics.json"),
    "bilstm": ("Bidirectional LSTM", "bilstm_metrics.json"),
    "attention_bilstm": ("Attention-BiLSTM", "attention_bilstm_metrics.json"),
    "bert_finetuned": ("Fine-Tuned BERT", "bert_metrics.json"),
}


@router.get("/metrics")
def get_all_metrics():
    """Retrieve detailed evaluation metrics across all trained models."""
    results = {}
    for key, (name, fname) in METRIC_FILES.items():
        fpath = os.path.join(MODELS_DIR, fname)
        if os.path.exists(fpath):
            with open(fpath, "r") as f:
                data = json.load(f)
                results[key] = data
    return {"metrics": results}


@router.get("/metrics/summary")
def get_metrics_summary():
    """Retrieve tabular summary of key evaluation metrics for comparison charts."""
    table = []
    for key, (name, fname) in METRIC_FILES.items():
        fpath = os.path.join(MODELS_DIR, fname)
        if os.path.exists(fpath):
            with open(fpath, "r") as f:
                data = json.load(f)
                table.append(
                    {
                        "model_id": key,
                        "model_name": data.get("model_name", name),
                        "accuracy": data.get("accuracy", 0.0),
                        "precision_macro": data.get("precision_macro", 0.0),
                        "recall_macro": data.get("recall_macro", 0.0),
                        "f1_macro": data.get("f1_macro", 0.0),
                        "f1_weighted": data.get("f1_weighted", 0.0),
                    }
                )
    return {"summary_table": table}

