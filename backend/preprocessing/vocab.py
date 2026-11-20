"""Vocabulary and Sequence Processing for PyTorch Neural Classifiers.

Provides token-to-index mapping, OOV (<UNK>) handling, sequence padding/truncation,
and embedding weight extraction from Word2Vec models.
"""

import json
import os
from typing import List, Dict, Optional, Tuple
import numpy as np


class Vocabulary:
    """Vocabulary manager handling token indices, padding, and unknown tokens."""

    PAD_TOKEN = "<PAD>"
    UNK_TOKEN = "<UNK>"

    def __init__(self, min_freq: int = 2, max_size: Optional[int] = 20000):
        self.min_freq = min_freq
        self.max_size = max_size
        self.word2idx: Dict[str, int] = {self.PAD_TOKEN: 0, self.UNK_TOKEN: 1}
        self.idx2word: Dict[int, str] = {0: self.PAD_TOKEN, 1: self.UNK_TOKEN}
        self.word_counts: Dict[str, int] = {}
        self.is_built: bool = False

    def build_vocab(self, tokenized_texts: List[List[str]]) -> "Vocabulary":
        """Build vocabulary mapping from a corpus of tokenized documents."""
        counts: Dict[str, int] = {}
        for tokens in tokenized_texts:
            for token in tokens:
                counts[token] = counts.get(token, 0) + 1

        self.word_counts = counts

        # Filter by min_freq and sort by frequency
        filtered_words = [
            word for word, count in counts.items() if count >= self.min_freq
        ]
        sorted_words = sorted(
            filtered_words, key=lambda w: self.word_counts[w], reverse=True
        )

        if self.max_size is not None:
            sorted_words = sorted_words[: self.max_size - 2]  # reserve for PAD and UNK

        for idx, word in enumerate(sorted_words, start=2):
            self.word2idx[word] = idx
            self.idx2word[idx] = word

        self.is_built = True
        return self

    def __len__(self) -> int:
        return len(self.word2idx)

    def token_to_id(self, token: str) -> int:
        """Map single token to index with UNK fallback."""
        return self.word2idx.get(token, self.word2idx[self.UNK_TOKEN])

    def id_to_token(self, idx: int) -> str:
        """Map index back to string token."""
        return self.idx2word.get(idx, self.UNK_TOKEN)

    def tokens_to_indices(
        self, tokens: List[str], max_len: int = 100
    ) -> List[int]:
        """Convert a list of tokens into padded/truncated integer indices."""
        indices = [self.token_to_id(t) for t in tokens]
        if len(indices) < max_len:
            # Pad with 0 (<PAD>)
            indices += [self.word2idx[self.PAD_TOKEN]] * (max_len - len(indices))
        else:
            # Truncate to max_len
            indices = indices[:max_len]
        return indices

    def build_embedding_matrix(
        self, word2vec_model, embedding_dim: int = 100
    ) -> np.ndarray:
        """Create PyTorch-compatible embedding weights initialized from Word2Vec."""
        vocab_size = len(self.word2idx)
        matrix = np.random.normal(scale=0.05, size=(vocab_size, embedding_dim)).astype(np.float32)
        matrix[0] = np.zeros(embedding_dim, dtype=np.float32)  # PAD index has 0 vector

        in_vocab_count = 0
        for word, idx in self.word2idx.items():
            if idx == 0:
                continue
            if word in word2vec_model.wv:
                matrix[idx] = word2vec_model.wv[word]
                in_vocab_count += 1

        return matrix

    def save(self, filepath: str):
        """Save vocabulary state to JSON."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        data = {
            "min_freq": self.min_freq,
            "max_size": self.max_size,
            "word2idx": self.word2idx,
            "word_counts": self.word_counts,
        }
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f)

    @classmethod
    def load(cls, filepath: str) -> "Vocabulary":
        """Load vocabulary state from JSON."""
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        vocab = cls(min_freq=data["min_freq"], max_size=data["max_size"])
        vocab.word2idx = data["word2idx"]
        vocab.idx2word = {int(k) if isinstance(k, int) else int(v): k for k, v in data["word2idx"].items()}
        # Ensure proper idx2word mapping
        vocab.idx2word = {v: k for k, v in vocab.word2idx.items()}
        vocab.word_counts = data.get("word_counts", {})
        vocab.is_built = True
        return vocab

