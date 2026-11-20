"""Pydantic request and response schemas for ShieldText predictions."""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """Payload for individual text classification."""

    text: str = Field(..., min_length=1, max_length=2000, description="Raw input text to classify.")
    model_id: str = Field(
        default="bilstm",
        description="Model architecture to use for classification.",
    )


class PredictionResponse(BaseModel):
    """Result of cyberbullying detection and explainability."""

    text: str
    preprocessed_text: str
    model_id: str
    predicted_label: str
    is_cyberbullying: bool
    confidence: float
    probabilities: Dict[str, float]
    explanation: Optional[Dict[str, Any]] = None
    safeguard_notice: str

