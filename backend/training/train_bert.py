"""Fine-tuning Pretrained Transformer / BERT Model for ShieldText Cyberbullying Classification."""

import argparse
import json
import logging
import os
import time
from typing import Dict, Any
import pandas as pd
import torch
from torch.utils.data import DataLoader, Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    get_linear_schedule_with_warmup,
)

from backend.evaluation.metrics import compute_metrics, save_metrics

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "saved_models")
BERT_OUTPUT_DIR = os.path.join(MODELS_DIR, "bert_finetuned")


class CyberbullyingDataset(Dataset):
    """PyTorch Dataset for Transformer tokenization."""

    def __init__(self, texts: list, labels: list, tokenizer, max_len: int = 128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]

        encoding = self.tokenizer(
            text,
            truncation=True,
            padding="max_length",
            max_length=self.max_len,
            return_tensors="pt",
        )

        return {
            "input_ids": encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
            "label": torch.tensor(label, dtype=torch.long),
        }


def get_device() -> torch.device:
    """Select compute device."""
    if torch.backends.mps.is_available():
        return torch.device("mps")
    elif torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


def train_bert_classifier(
    pretrained_model_name: str = "distilbert-base-uncased",
    epochs: int = 2,
    batch_size: int = 32,
    lr: float = 3e-5,
    quick_mode: bool = False,
) -> Dict[str, Any]:
    """Fine-tune a pretrained BERT / DistilBERT transformer for cyberbullying classification."""
    os.makedirs(BERT_OUTPUT_DIR, exist_ok=True)
    device = get_device()
    logger.info("Initializing Transformer fine-tuning with %s on %s...", pretrained_model_name, device)

    train_df = pd.read_csv(os.path.join(DATA_DIR, "train.csv"))
    val_df = pd.read_csv(os.path.join(DATA_DIR, "val.csv"))
    test_df = pd.read_csv(os.path.join(DATA_DIR, "test.csv"))

    with open(os.path.join(DATA_DIR, "label_mapping.json"), "r") as f:
        mapping = json.load(f)
    id2label = {int(k): v for k, v in mapping["id2label"].items()}
    label2id = mapping["label2id"]
    class_names = [id2label[i] for i in range(len(id2label))]

    if quick_mode:
        logger.info("Quick mode enabled: Using 4,000 train samples and 1,000 val/test samples for rapid fine-tuning.")
        train_df = train_df.sample(n=min(4000, len(train_df)), random_state=42).reset_index(drop=True)
        val_df = val_df.sample(n=min(1000, len(val_df)), random_state=42).reset_index(drop=True)
        test_df = test_df.sample(n=min(1000, len(test_df)), random_state=42).reset_index(drop=True)
        epochs = min(epochs, 1)

    logger.info("Loading Tokenizer and Pretrained Model: %s", pretrained_model_name)
    tokenizer = AutoTokenizer.from_pretrained(pretrained_model_name)
    model = AutoModelForSequenceClassification.from_pretrained(
        pretrained_model_name,
        num_labels=len(class_names),
        id2label=id2label,
        label2id=label2id,
    )
    model.to(device)

    # Datasets and Loaders
    # Note: For transformers, we use transformer_text (preserving punctuation, emojis, casing context)
    train_ds = CyberbullyingDataset(train_df["transformer_text"].tolist(), train_df["label_id"].tolist(), tokenizer)
    val_ds = CyberbullyingDataset(val_df["transformer_text"].tolist(), val_df["label_id"].tolist(), tokenizer)
    test_ds = CyberbullyingDataset(test_df["transformer_text"].tolist(), test_df["label_id"].tolist(), tokenizer)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False)

    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=0.01)
    total_steps = len(train_loader) * epochs
    scheduler = get_linear_schedule_with_warmup(
        optimizer, num_warmup_steps=int(total_steps * 0.1), num_training_steps=total_steps
    )

    best_val_loss = float("inf")
    start_time = time.time()

    for epoch in range(1, epochs + 1):
        model.train()
        total_train_loss = 0.0
        correct_train = 0
        total_train = 0

        for step, batch in enumerate(train_loader):
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["label"].to(device)

            optimizer.zero_grad()
            outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
            loss = outputs.loss
            logits = outputs.logits

            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            scheduler.step()

            total_train_loss += loss.item() * len(labels)
            preds = logits.argmax(dim=1)
            correct_train += (preds == labels).sum().item()
            total_train += len(labels)

            if (step + 1) % 50 == 0 or (step + 1) == len(train_loader):
                logger.info(
                    "Epoch %d/%d - Step %d/%d - Batch Loss: %.4f",
                    epoch,
                    epochs,
                    step + 1,
                    len(train_loader),
                    loss.item(),
                )

        train_loss = total_train_loss / total_train
        train_acc = correct_train / total_train

        # Validation
        model.eval()
        total_val_loss = 0.0
        correct_val = 0
        total_val = 0

        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch["input_ids"].to(device)
                attention_mask = batch["attention_mask"].to(device)
                labels = batch["label"].to(device)

                outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
                loss = outputs.loss
                logits = outputs.logits

                total_val_loss += loss.item() * len(labels)
                preds = logits.argmax(dim=1)
                correct_val += (preds == labels).sum().item()
                total_val += len(labels)

        val_loss = total_val_loss / total_val
        val_acc = correct_val / total_val

        logger.info(
            "[BERT] Epoch %d/%d - Train Loss: %.4f, Train Acc: %.4f | Val Loss: %.4f, Val Acc: %.4f",
            epoch,
            epochs,
            train_loss,
            train_acc,
            val_loss,
            val_acc,
        )

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            logger.info("Saving best transformer checkpoint to %s...", BERT_OUTPUT_DIR)
            model.save_pretrained(BERT_OUTPUT_DIR)
            tokenizer.save_pretrained(BERT_OUTPUT_DIR)

    fine_tune_time = round(time.time() - start_time, 2)
    logger.info("Fine-tuning completed in %.2f seconds", fine_tune_time)

    # Final Test Evaluation
    logger.info("Evaluating fine-tuned Transformer on independent test set...")
    best_model = AutoModelForSequenceClassification.from_pretrained(BERT_OUTPUT_DIR)
    best_model.to(device)
    best_model.eval()

    all_preds = []
    all_targets = []

    with torch.no_grad():
        for batch in test_loader:
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["label"].to(device)

            outputs = best_model(input_ids=input_ids, attention_mask=attention_mask)
            preds = outputs.logits.argmax(dim=1).cpu().numpy().tolist()
            all_preds.extend(preds)
            all_targets.extend(labels.cpu().numpy().tolist())

    metrics = compute_metrics(
        all_targets,
        all_preds,
        class_names=class_names,
        model_name=f"Fine-Tuned BERT ({pretrained_model_name})",
    )
    metrics["training_time_seconds"] = fine_tune_time
    metrics["base_model"] = pretrained_model_name

    save_metrics(metrics, os.path.join(MODELS_DIR, "bert_metrics.json"))
    logger.info(
        "Transformer Test Results - Acc: %.4f, Macro F1: %.4f",
        metrics["accuracy"],
        metrics["f1_macro"],
    )
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model_name", type=str, default="distilbert-base-uncased")
    parser.add_argument("--epochs", type=int, default=2)
    parser.add_argument("--quick", action="store_true", help="Quick fine-tuning mode")
    args = parser.parse_args()

    metrics = train_bert_classifier(
        pretrained_model_name=args.model_name, epochs=args.epochs, quick_mode=args.quick
    )
    print("\n=== Transformer Fine-Tuning Complete ===")
    print(f"Accuracy: {metrics['accuracy']:.4f}, Macro F1: {metrics['f1_macro']:.4f}")

