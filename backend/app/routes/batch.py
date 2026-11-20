"""Batch analysis endpoints for uploaded CSV files."""

import io
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
import pandas as pd
from backend.app.services.model_service import model_service

router = APIRouter(prefix="/api", tags=["Batch Analysis"])


@router.post("/batch")
async def analyze_batch(
    file: UploadFile = File(...),
    model_id: str = Form("bilstm"),
    text_column: Optional[str] = Form(None),
):
    """Process a batch of texts from an uploaded CSV file."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files (.csv) are supported.")

    try:
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode("utf-8", errors="replace")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    if len(df) == 0:
        raise HTTPException(status_code=400, detail="The uploaded CSV file is empty.")

    # Auto-detect text column if not specified
    if not text_column or text_column not in df.columns:
        candidates = ["text", "tweet_text", "comment", "content", "message", "post"]
        matched = [c for c in candidates if c in df.columns]
        if matched:
            text_column = matched[0]
        else:
            # Fallback to first string/object column
            obj_cols = df.select_dtypes(include=["object"]).columns.tolist()
            if obj_cols:
                text_column = obj_cols[0]
            else:
                text_column = df.columns[0]

    # Limit to 500 rows for real-time API responsiveness
    max_rows = 500
    if len(df) > max_rows:
        df = df.iloc[:max_rows]

    records = []
    category_counts = {}
    total_flagged = 0

    for idx, row in df.iterrows():
        raw_text = str(row[text_column]) if pd.notnull(row[text_column]) else ""
        if not raw_text.strip():
            continue

        try:
            pred = model_service.predict(raw_text, model_id=model_id)
            label = pred["predicted_label"]
            conf = pred["confidence"]
            harmful = pred["is_cyberbullying"]

            if harmful:
                total_flagged += 1
            category_counts[label] = category_counts.get(label, 0) + 1

            records.append(
                {
                    "row_id": idx + 1,
                    "text": raw_text[:120] + ("..." if len(raw_text) > 120 else ""),
                    "full_text": raw_text,
                    "predicted_label": label,
                    "confidence": conf,
                    "is_cyberbullying": harmful,
                }
            )
        except Exception:
            continue

    total_processed = len(records)
    harmful_ratio = round((total_flagged / total_processed) * 100, 1) if total_processed > 0 else 0.0

    return {
        "filename": file.filename,
        "text_column_used": text_column,
        "total_records_processed": total_processed,
        "total_flagged_harmful": total_flagged,
        "harmful_percentage": harmful_ratio,
        "category_distribution": category_counts,
        "records": records,
    }

