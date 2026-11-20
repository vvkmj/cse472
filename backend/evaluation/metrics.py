"""Evaluation metrics and reporting utilities for ShieldText.

Computes accuracy, precision, recall, macro/weighted F1, confusion matrices,
and saves formatted benchmark results.
"""

import json
import os
from typing import Dict, Any, List, Optional
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)


def compute_metrics(
    y_true: List[int],
    y_pred: List[int],
    class_names: Optional[List[str]] = None,
    model_name: str = "Model",
) -> Dict[str, Any]:
    """Calculate comprehensive classification metrics."""
    acc = float(accuracy_score(y_true, y_pred))
    p_macro = float(precision_score(y_true, y_pred, average="macro", zero_division=0))
    r_macro = float(recall_score(y_true, y_pred, average="macro", zero_division=0))
    f1_macro = float(f1_score(y_true, y_pred, average="macro", zero_division=0))

    p_weighted = float(precision_score(y_true, y_pred, average="weighted", zero_division=0))
    r_weighted = float(recall_score(y_true, y_pred, average="weighted", zero_division=0))
    f1_weighted = float(f1_score(y_true, y_pred, average="weighted", zero_division=0))

    cm = confusion_matrix(y_true, y_pred).tolist()
    report_dict = classification_report(
        y_true,
        y_pred,
        target_names=class_names if class_names else None,
        output_dict=True,
        zero_division=0,
    )

    return {
        "model_name": model_name,
        "accuracy": round(acc, 4),
        "precision_macro": round(p_macro, 4),
        "recall_macro": round(r_macro, 4),
        "f1_macro": round(f1_macro, 4),
        "precision_weighted": round(p_weighted, 4),
        "recall_weighted": round(r_weighted, 4),
        "f1_weighted": round(f1_weighted, 4),
        "confusion_matrix": cm,
        "class_report": report_dict,
        "class_names": class_names,
    }


def save_metrics(metrics: Dict[str, Any], filepath: str):
    """Save metrics dictionary to a JSON file."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

