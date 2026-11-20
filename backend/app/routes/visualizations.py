"""Endpoints serving data for interactive NLP visualizations."""

import json
import os
from fastapi import APIRouter
from backend.preprocessing.pipeline import TextPreprocessor

router = APIRouter(prefix="/api/visualizations", tags=["NLP Visualizations"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "saved_models")
DATA_DIR = os.path.join(BASE_DIR, "data", "processed")


@router.get("/word2vec")
def get_word2vec_visualizations():
    """Retrieve 2D PCA/t-SNE coordinates, analogies, and semantic similarities."""
    vis_path = os.path.join(MODELS_DIR, "word2vec_visualizations.json")
    comp_path = os.path.join(MODELS_DIR, "word2vec_comparison.json")

    vis_data = {}
    if os.path.exists(vis_path):
        with open(vis_path, "r") as f:
            vis_data = json.load(f)

    comp_data = {}
    if os.path.exists(comp_path):
        with open(comp_path, "r") as f:
            comp_data = json.load(f)

    return {"visualizations": vis_data, "comparison": comp_data}


@router.get("/dataset")
def get_dataset_statistics():
    """Retrieve class distribution and dataset characteristics."""
    sum_path = os.path.join(DATA_DIR, "dataset_summary.json")
    if os.path.exists(sum_path):
        with open(sum_path, "r") as f:
            return json.load(f)
    return {"status": "Dataset summary not yet compiled"}


@router.get("/preprocessing")
def get_preprocessing_demonstration():
    """Retrieve live before-and-after preprocessing examples and academic tradeoffs."""
    preprocessor = TextPreprocessor()
    demo = preprocessor.get_before_after_demonstration()
    tradeoffs = preprocessor.explain_preprocessing_tradeoffs()
    return {"demonstration": demo, "tradeoffs": tradeoffs}

