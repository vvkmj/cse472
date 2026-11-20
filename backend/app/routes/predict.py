"""Prediction endpoints for single text analysis."""

from fastapi import APIRouter, HTTPException
from backend.app.schemas.predict import PredictionRequest, PredictionResponse
from backend.app.services.model_service import model_service

router = APIRouter(prefix="/api", tags=["Prediction"])


@router.get("/models")
def get_models():
    """Retrieve catalog of all supported model architectures."""
    return {"models": model_service.get_available_models()}


@router.post("/predict", response_model=PredictionResponse)
def predict_text(request: PredictionRequest):
    """Classify input text using the requested NLP model architecture."""
    try:
        result = model_service.predict(request.text, request.model_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

