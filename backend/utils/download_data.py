"""Data downloading and verification script for ShieldText.

Downloads the Wang et al. (2021) Cyberbullying Classification Dataset
from Hugging Face and saves it into data/raw/cyberbullying_tweets.csv.
"""

import os
import shutil
import logging
import pandas as pd
from huggingface_hub import hf_hub_download

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

RAW_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "raw")
TARGET_PATH = os.path.join(RAW_DATA_DIR, "cyberbullying_tweets.csv")
REPO_ID = "poorvanshi04/cyberbullying_tweets.csv"
FILENAME = "cyberbullying_tweets.csv"


def download_dataset(force: bool = False) -> str:
    """Download the cyberbullying dataset if not already present."""
    os.makedirs(RAW_DATA_DIR, exist_ok=True)
    if os.path.exists(TARGET_PATH) and not force:
        logger.info("Dataset already exists at %s", TARGET_PATH)
        return TARGET_PATH

    logger.info("Downloading dataset from Hugging Face repository %s...", REPO_ID)
    downloaded_path = hf_hub_download(repo_id=REPO_ID, filename=FILENAME, repo_type="dataset")
    shutil.copyfile(downloaded_path, TARGET_PATH)
    logger.info("Dataset saved to %s", TARGET_PATH)
    return TARGET_PATH


def verify_dataset(filepath: str) -> dict:
    """Verify dataset integrity, schema, and statistics."""
    df = pd.read_csv(filepath)
    expected_cols = {"tweet_text", "cyberbullying_type"}
    if not expected_cols.issubset(set(df.columns)):
        raise ValueError(f"Missing expected columns! Found: {df.columns.tolist()}")

    null_counts = df.isnull().sum().to_dict()
    duplicates = int(df.duplicated(subset=["tweet_text"]).sum())
    class_counts = df["cyberbullying_type"].value_counts().to_dict()

    summary = {
        "total_records": len(df),
        "columns": df.columns.tolist(),
        "null_counts": null_counts,
        "duplicate_text_records": duplicates,
        "class_counts": class_counts,
        "num_classes": len(class_counts),
    }

    logger.info("Dataset verification summary: %s", summary)
    return summary


if __name__ == "__main__":
    path = download_dataset()
    summary = verify_dataset(path)
    print("\n=== Dataset Verification Success ===")
    print(f"File: {path}")
    print(f"Total Rows: {summary['total_records']}")
    print(f"Classes: {list(summary['class_counts'].keys())}")
    print(f"Duplicate tweets: {summary['duplicate_text_records']}")

