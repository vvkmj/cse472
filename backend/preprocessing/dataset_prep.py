"""Dataset preparation, cleaning, deduplication, and stratified splitting for ShieldText."""

import json
import logging
import os
from typing import Dict, Any
import pandas as pd
from sklearn.model_selection import train_test_split

from backend.preprocessing.pipeline import TextPreprocessor

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
RAW_PATH = os.path.join(BASE_DIR, "data", "raw", "cyberbullying_tweets.csv")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")


def prepare_dataset(
    raw_path: str = RAW_PATH,
    output_dir: str = PROCESSED_DIR,
    train_size: float = 0.70,
    val_size: float = 0.15,
    test_size: float = 0.15,
    random_state: int = 42,
) -> Dict[str, Any]:
    """Clean, preprocess, and partition dataset into stratified train/val/test splits."""
    os.makedirs(output_dir, exist_ok=True)
    logger.info("Loading raw dataset from %s...", raw_path)
    df = pd.read_csv(raw_path)

    initial_count = len(df)
    logger.info("Initial record count: %d", initial_count)

    # 1. Null check
    df = df.dropna(subset=["tweet_text", "cyberbullying_type"])

    # 2. Duplicate detection and handling
    raw_duplicates = int(df.duplicated(subset=["tweet_text"]).sum())
    logger.info("Detected %d duplicate tweet texts. Removing duplicates to prevent data leakage...", raw_duplicates)
    df = df.drop_duplicates(subset=["tweet_text"]).reset_index(drop=True)
    deduped_count = len(df)
    logger.info("Post-deduplication record count: %d", deduped_count)

    # 3. Text Preprocessing
    preprocessor = TextPreprocessor()
    logger.info("Running text preprocessing across %d records...", deduped_count)
    df["clean_text"] = df["tweet_text"].apply(preprocessor.preprocess_for_classical)
    df["transformer_text"] = df["tweet_text"].apply(preprocessor.preprocess_for_transformer)

    # Filter out records that became completely empty after cleaning
    df = df[df["clean_text"].str.strip().str.len() > 0].reset_index(drop=True)
    valid_count = len(df)
    logger.info("Valid non-empty records after cleaning: %d", valid_count)

    # 4. Label Encoding
    unique_classes = sorted(df["cyberbullying_type"].unique().tolist())
    label2id = {label: idx for idx, label in enumerate(unique_classes)}
    id2label = {idx: label for label, idx in label2id.items()}
    df["label_id"] = df["cyberbullying_type"].map(label2id)

    # 5. Stratified Splitting: Train (70%), Val (15%), Test (15%)
    # First split into train and temp (val + test)
    temp_size = val_size + test_size
    train_df, temp_df = train_test_split(
        df,
        test_size=temp_size,
        stratify=df["label_id"],
        random_state=random_state,
    )

    # Split temp into val and test equally (0.15 / 0.30 = 0.5)
    val_ratio = val_size / temp_size
    val_df, test_df = train_test_split(
        temp_df,
        test_size=(1.0 - val_ratio),
        stratify=temp_df["label_id"],
        random_state=random_state,
    )

    train_df = train_df.reset_index(drop=True)
    val_df = val_df.reset_index(drop=True)
    test_df = test_df.reset_index(drop=True)

    logger.info(
        "Split sizes: Train=%d (%.1f%%), Val=%d (%.1f%%), Test=%d (%.1f%%)",
        len(train_df),
        100 * len(train_df) / valid_count,
        len(val_df),
        100 * len(val_df) / valid_count,
        len(test_df),
        100 * len(test_df) / valid_count,
    )

    # Save files
    train_path = os.path.join(output_dir, "train.csv")
    val_path = os.path.join(output_dir, "val.csv")
    test_path = os.path.join(output_dir, "test.csv")

    train_df.to_csv(train_path, index=False)
    val_df.to_csv(val_path, index=False)
    test_df.to_csv(test_path, index=False)

    mapping_path = os.path.join(output_dir, "label_mapping.json")
    with open(mapping_path, "w", encoding="utf-8") as f:
        json.dump({"label2id": label2id, "id2label": id2label}, f, indent=2)

    summary = {
        "initial_raw_records": initial_count,
        "duplicate_records_removed": raw_duplicates,
        "valid_processed_records": valid_count,
        "train_records": len(train_df),
        "val_records": len(val_df),
        "test_records": len(test_df),
        "label2id": label2id,
        "id2label": id2label,
        "train_class_distribution": train_df["cyberbullying_type"].value_counts().to_dict(),
        "test_class_distribution": test_df["cyberbullying_type"].value_counts().to_dict(),
    }

    summary_path = os.path.join(output_dir, "dataset_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    logger.info("Dataset preparation complete! Artifacts saved to %s", output_dir)
    return summary


if __name__ == "__main__":
    summary = prepare_dataset()
    print("\nDataset Preparation Finished Successfully:")
    print(f"Train: {summary['train_records']}, Val: {summary['val_records']}, Test: {summary['test_records']}")
    print("Classes:", summary["label2id"])

