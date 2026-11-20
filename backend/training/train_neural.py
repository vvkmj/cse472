"""Training pipeline for LSTM, BiLSTM, and Attention-BiLSTM Neural Classifiers."""

import argparse
import json
import logging
import os
import time
from typing import Dict, Any, Tuple
from gensim.models import Word2Vec
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

from backend.evaluation.metrics import compute_metrics, save_metrics
from backend.models.neural_models import (
    LSTMClassifier,
    BiLSTMClassifier,
    AttentionBiLSTMClassifier,
)
from backend.preprocessing.vocab import Vocabulary

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "saved_models")


def get_device() -> torch.device:
    """Select best available device: MPS (Apple Silicon), CUDA, or CPU."""
    if torch.backends.mps.is_available():
        return torch.device("mps")
    elif torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


def create_dataloader(
    df: pd.DataFrame, vocab: Vocabulary, max_len: int = 80, batch_size: int = 64, shuffle: bool = True
) -> DataLoader:
    """Convert dataframe text and labels into PyTorch DataLoader."""
    sentences = [str(t).split() for t in df["clean_text"]]
    indices = [vocab.tokens_to_indices(s, max_len=max_len) for s in sentences]
    x_tensor = torch.tensor(indices, dtype=torch.long)
    y_tensor = torch.tensor(df["label_id"].values, dtype=torch.long)
    dataset = TensorDataset(x_tensor, y_tensor)
    return DataLoader(dataset, batch_size=batch_size, shuffle=shuffle)


def train_single_model(
    model: nn.Module,
    train_loader: DataLoader,
    val_loader: DataLoader,
    device: torch.device,
    model_name: str,
    checkpoint_path: str,
    epochs: int = 8,
    lr: float = 1e-3,
    patience: int = 3,
    is_attention: bool = False,
) -> nn.Module:
    """Train a PyTorch neural classifier with early stopping and best model checkpointing."""
    model = model.to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=1e-5)

    best_val_loss = float("inf")
    patience_counter = 0
    start_time = time.time()

    logger.info("Starting training for %s on device: %s", model_name, device)

    for epoch in range(1, epochs + 1):
        model.train()
        total_train_loss = 0.0
        correct_train = 0
        total_train = 0

        for x_batch, y_batch in train_loader:
            x_batch, y_batch = x_batch.to(device), y_batch.to(device)
            optimizer.zero_grad()

            if is_attention:
                logits, _ = model(x_batch)
            else:
                logits = model(x_batch)

            loss = criterion(logits, y_batch)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=5.0)
            optimizer.step()

            total_train_loss += loss.item() * len(y_batch)
            preds = logits.argmax(dim=1)
            correct_train += (preds == y_batch).sum().item()
            total_train += len(y_batch)

        train_loss = total_train_loss / total_train
        train_acc = correct_train / total_train

        # Validation
        model.eval()
        total_val_loss = 0.0
        correct_val = 0
        total_val = 0

        with torch.no_grad():
            for x_batch, y_batch in val_loader:
                x_batch, y_batch = x_batch.to(device), y_batch.to(device)
                if is_attention:
                    logits, _ = model(x_batch)
                else:
                    logits = model(x_batch)

                loss = criterion(logits, y_batch)
                total_val_loss += loss.item() * len(y_batch)
                preds = logits.argmax(dim=1)
                correct_val += (preds == y_batch).sum().item()
                total_val += len(y_batch)

        val_loss = total_val_loss / total_val
        val_acc = correct_val / total_val

        logger.info(
            "[%s] Epoch %d/%d - Train Loss: %.4f, Train Acc: %.4f | Val Loss: %.4f, Val Acc: %.4f",
            model_name,
            epoch,
            epochs,
            train_loss,
            train_acc,
            val_loss,
            val_acc,
        )

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            patience_counter = 0
            torch.save(model.state_dict(), checkpoint_path)
            logger.info("Saved new best checkpoint for %s (Val Loss: %.4f)", model_name, val_loss)
        else:
            patience_counter += 1
            if patience_counter >= patience:
                logger.info("Early stopping triggered for %s at epoch %d", model_name, epoch)
                break

    total_time = round(time.time() - start_time, 2)
    logger.info("Training %s finished in %.2f seconds", model_name, total_time)

    # Load best checkpoint
    model.load_state_dict(torch.load(checkpoint_path, map_location=device))
    return model


def evaluate_neural_model(
    model: nn.Module,
    test_loader: DataLoader,
    device: torch.device,
    class_names: list,
    model_name: str,
    is_attention: bool = False,
) -> Dict[str, Any]:
    """Evaluate trained PyTorch neural model on test set."""
    model.eval()
    all_preds = []
    all_targets = []

    with torch.no_grad():
        for x_batch, y_batch in test_loader:
            x_batch = x_batch.to(device)
            if is_attention:
                logits, _ = model(x_batch)
            else:
                logits = model(x_batch)

            preds = logits.argmax(dim=1).cpu().numpy().tolist()
            all_preds.extend(preds)
            all_targets.extend(y_batch.numpy().tolist())

    return compute_metrics(all_targets, all_preds, class_names=class_names, model_name=model_name)


def run_neural_training(quick_mode: bool = False, epochs: int = 6) -> Dict[str, Any]:
    """Complete training and evaluation routine for LSTM, BiLSTM, and Attention-BiLSTM."""
    os.makedirs(MODELS_DIR, exist_ok=True)
    device = get_device()
    logger.info("Using compute device: %s", device)

    train_df = pd.read_csv(os.path.join(DATA_DIR, "train.csv"))
    val_df = pd.read_csv(os.path.join(DATA_DIR, "val.csv"))
    test_df = pd.read_csv(os.path.join(DATA_DIR, "test.csv"))

    with open(os.path.join(DATA_DIR, "label_mapping.json"), "r") as f:
        mapping = json.load(f)
    id2label = {int(k): v for k, v in mapping["id2label"].items()}
    class_names = [id2label[i] for i in range(len(id2label))]

    if quick_mode:
        logger.info("Quick mode enabled: Subsampling data for rapid neural verification.")
        train_df = train_df.sample(n=min(8000, len(train_df)), random_state=42).reset_index(drop=True)
        val_df = val_df.sample(n=min(2000, len(val_df)), random_state=42).reset_index(drop=True)
        test_df = test_df.sample(n=min(2000, len(test_df)), random_state=42).reset_index(drop=True)
        epochs = min(epochs, 4)

    # 1. Vocabulary
    vocab_path = os.path.join(MODELS_DIR, "vocab.json")
    train_tokens = [str(t).split() for t in train_df["clean_text"]]
    vocab = Vocabulary(min_freq=2, max_size=20000).build_vocab(train_tokens)
    vocab.save(vocab_path)
    logger.info("Vocabulary built with %d tokens and saved to %s", len(vocab), vocab_path)

    # 2. Embedding Matrix from Word2Vec CBOW
    w2v_path = os.path.join(MODELS_DIR, "word2vec_cbow.model")
    if os.path.exists(w2v_path):
        logger.info("Loading pretrained Word2Vec CBOW vectors for embedding initialization...")
        w2v = Word2Vec.load(w2v_path)
        emb_matrix = vocab.build_embedding_matrix(w2v, embedding_dim=100)
        pretrained_weights = torch.tensor(emb_matrix, dtype=torch.float32)
    else:
        logger.info("No Word2Vec model found; using random Gaussian embedding initialization.")
        pretrained_weights = None

    # 3. DataLoaders
    batch_size = 64
    max_len = 80
    train_loader = create_dataloader(train_df, vocab, max_len=max_len, batch_size=batch_size, shuffle=True)
    val_loader = create_dataloader(val_df, vocab, max_len=max_len, batch_size=batch_size, shuffle=False)
    test_loader = create_dataloader(test_df, vocab, max_len=max_len, batch_size=batch_size, shuffle=False)

    results = {}

    # Model C1: LSTM
    lstm = LSTMClassifier(
        vocab_size=len(vocab),
        embed_dim=100,
        hidden_dim=128,
        num_classes=len(class_names),
        num_layers=2,
        dropout=0.3,
        pretrained_embeddings=pretrained_weights,
    )
    lstm_ckpt = os.path.join(MODELS_DIR, "lstm_best.pt")
    lstm = train_single_model(
        lstm, train_loader, val_loader, device, "LSTM", lstm_ckpt, epochs=epochs, is_attention=False
    )
    lstm_metrics = evaluate_neural_model(
        lstm, test_loader, device, class_names, "LSTM (Unidirectional)", is_attention=False
    )
    save_metrics(lstm_metrics, os.path.join(MODELS_DIR, "lstm_metrics.json"))
    results["lstm"] = lstm_metrics

    # Model C2: BiLSTM
    bilstm = BiLSTMClassifier(
        vocab_size=len(vocab),
        embed_dim=100,
        hidden_dim=128,
        num_classes=len(class_names),
        num_layers=2,
        dropout=0.3,
        pretrained_embeddings=pretrained_weights,
    )
    bilstm_ckpt = os.path.join(MODELS_DIR, "bilstm_best.pt")
    bilstm = train_single_model(
        bilstm, train_loader, val_loader, device, "BiLSTM", bilstm_ckpt, epochs=epochs, is_attention=False
    )
    bilstm_metrics = evaluate_neural_model(
        bilstm, test_loader, device, class_names, "Bidirectional LSTM", is_attention=False
    )
    save_metrics(bilstm_metrics, os.path.join(MODELS_DIR, "bilstm_metrics.json"))
    results["bilstm"] = bilstm_metrics

    # Model D: Attention-BiLSTM
    attn_bilstm = AttentionBiLSTMClassifier(
        vocab_size=len(vocab),
        embed_dim=100,
        hidden_dim=128,
        num_classes=len(class_names),
        num_layers=2,
        dropout=0.3,
        attn_dim=64,
        pretrained_embeddings=pretrained_weights,
    )
    attn_ckpt = os.path.join(MODELS_DIR, "attention_bilstm_best.pt")
    attn_bilstm = train_single_model(
        attn_bilstm, train_loader, val_loader, device, "Attention-BiLSTM", attn_ckpt, epochs=epochs, is_attention=True
    )
    attn_metrics = evaluate_neural_model(
        attn_bilstm, test_loader, device, class_names, "Attention-BiLSTM", is_attention=True
    )
    save_metrics(attn_metrics, os.path.join(MODELS_DIR, "attention_bilstm_metrics.json"))
    results["attention_bilstm"] = attn_metrics

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--quick", action="store_true", help="Run quick verification mode")
    parser.add_argument("--epochs", type=int, default=6, help="Number of training epochs")
    args = parser.parse_args()

    results = run_neural_training(quick_mode=args.quick, epochs=args.epochs)
    print("\n=== Neural Sequence Models Training Complete ===")
    for name, m in results.items():
        print(f"{m['model_name']} -> Acc: {m['accuracy']:.4f}, Macro F1: {m['f1_macro']:.4f}")

