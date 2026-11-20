"""Unit tests for ShieldText preprocessing, models, and FastAPI endpoints."""

import os
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.preprocessing.pipeline import TextPreprocessor
from backend.preprocessing.vocab import Vocabulary
from backend.app.services.model_service import model_service

client = TestClient(app)


def test_root_endpoint():
    """Verify root serves frontend HTML or API status."""
    response = client.get("/")
    assert response.status_code == 200
    # Should serve HTML or JSON
    assert "html" in response.headers.get("content-type", "") or response.json().get("status") == "Online"


def test_api_root_endpoint():
    """Verify /api metadata endpoint."""
    response = client.get("/api")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "ShieldText"
    assert data["status"] == "Online"


def test_health_endpoint():
    """Verify health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_models_catalog():
    """Verify model listing."""
    response = client.get("/api/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert len(data["models"]) >= 7


def test_preprocessor_pipeline():
    """Test text cleaning and negation preservation."""
    p = TextPreprocessor()
    text = "Hey @user! Visit https://test.org #alert! I do not like bullying 😡"
    classical = p.preprocess_for_classical(text)
    # Check negation is preserved
    assert "not" in classical
    # Check mention and URL are stripped
    assert "@user" not in classical
    assert "https" not in classical
    # Check emoji normalized
    assert "angryface" in classical or "angry_face" in classical


def test_vocabulary_mapping():
    """Test token to index and padding."""
    vocab = Vocabulary(min_freq=1)
    vocab.build_vocab([["cyberbullying", "detection", "nlp"]])
    indices = vocab.tokens_to_indices(["cyberbullying", "unknown_word_xyz"], max_len=5)
    assert len(indices) == 5
    # First token is in vocab (> 1)
    assert indices[0] >= 2
    # Second token is unknown (index 1)
    assert indices[1] == vocab.word2idx[Vocabulary.UNK_TOKEN]
    # Padded tokens are 0
    assert indices[2] == 0


def test_predict_endpoint_logistic_regression():
    """Test prediction endpoint using baseline model."""
    payload = {"text": "You are stupid and nobody likes you in this school", "model_id": "logistic_regression"}
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["model_id"] == "logistic_regression"
    assert "predicted_label" in data
    assert "confidence" in data
    assert "explanation" in data
    assert "probabilities" in data
    assert len(data["probabilities"]) == 6


def test_predict_endpoint_bilstm():
    """Test prediction endpoint using BiLSTM model."""
    payload = {"text": "Hope you have a fantastic day and great semester!", "model_id": "bilstm"}
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["model_id"] == "bilstm"
    assert "predicted_label" in data
    assert "is_cyberbullying" in data


def test_predict_endpoint_attention_bilstm():
    """Test attention-based BiLSTM prediction and attention weights."""
    payload = {"text": "Get out of our group you loser", "model_id": "attention_bilstm"}
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["model_id"] == "attention_bilstm"
    assert "explanation" in data
    assert "all_tokens_with_weights" in data["explanation"]


def test_predict_empty_text():
    """Test validation error on empty input."""
    payload = {"text": "   ", "model_id": "logistic_regression"}
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 400


def test_metrics_endpoints():
    """Test metrics overview and summary endpoints."""
    resp1 = client.get("/api/metrics")
    assert resp1.status_code == 200
    assert "metrics" in resp1.json()

    resp2 = client.get("/api/metrics/summary")
    assert resp2.status_code == 200
    assert "summary_table" in resp2.json()
    assert len(resp2.json()["summary_table"]) >= 6


def test_visualizations_endpoints():
    """Test visualization data endpoints."""
    resp1 = client.get("/api/visualizations/word2vec")
    assert resp1.status_code == 200

    resp2 = client.get("/api/visualizations/preprocessing")
    assert resp2.status_code == 200
    assert "demonstration" in resp2.json()
    assert "tradeoffs" in resp2.json()

    resp3 = client.get("/api/visualizations/dataset")
    assert resp3.status_code == 200


def test_info_endpoint():
    """Test project documentation and course alignment endpoint."""
    response = client.get("/api/info")
    assert response.status_code == 200
    data = response.json()
    assert data["project_name"] == "ShieldText"
    assert "course_mapping" in data
    assert len(data["course_mapping"]) == 6


def test_pdf_download_endpoints():
    """Test presentation and detailed report PDF download endpoints."""
    resp1 = client.get("/api/info/presentation-pdf")
    assert resp1.status_code == 200
    assert resp1.headers["content-type"] == "application/pdf"
    assert len(resp1.content) > 10000

    resp2 = client.get("/api/info/report-pdf")
    assert resp2.status_code == 200
    assert resp2.headers["content-type"] == "application/pdf"
    assert len(resp2.content) > 10000


def test_exported_model_engine_integrity():
    """Verify exported statistical model engine exists and has full feature coverage."""
    import json
    engine_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "netlify", "functions", "model_engine.json"
    )
    assert os.path.exists(engine_path), "model_engine.json must exist in netlify/functions"
    with open(engine_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert "vocabulary" in data
    assert len(data["vocabulary"]) >= 15000
    assert len(data["classes"]) == 6
    assert len(data["lr_intercept"]) == 6
    assert len(data["svm_intercept"]) == 6


