"""PyTorch Neural Architectures for ShieldText: LSTM, BiLSTM, and Attention-Based BiLSTM."""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional, Tuple


class LSTMClassifier(nn.Module):
    """Unidirectional 2-layer LSTM text classifier with masked pooling and dense head."""

    def __init__(
        self,
        vocab_size: int,
        embed_dim: int = 100,
        hidden_dim: int = 128,
        num_classes: int = 6,
        num_layers: int = 2,
        dropout: float = 0.3,
        padding_idx: int = 0,
        pretrained_embeddings: Optional[torch.Tensor] = None,
    ):
        super().__init__()
        self.padding_idx = padding_idx
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=padding_idx)
        if pretrained_embeddings is not None:
            self.embedding.weight.data.copy_(pretrained_embeddings)
        self.embedding.weight.requires_grad = True

        self.lstm = nn.LSTM(
            embed_dim,
            hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=False,
            dropout=dropout if num_layers > 1 else 0.0,
        )
        self.dropout = nn.Dropout(dropout)
        self.fc1 = nn.Linear(hidden_dim, 64)
        self.classifier = nn.Linear(64, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (batch_size, seq_len)
        mask = (x != self.padding_idx).unsqueeze(-1)  # (B, L, 1)
        embedded = self.dropout(self.embedding(x))  # (B, L, E)
        lstm_out, _ = self.lstm(embedded)  # (B, L, H)

        # Masked max pooling over valid tokens to avoid pad token degradation
        masked_out = lstm_out.masked_fill(~mask, -1e9)
        pooled = torch.max(masked_out, dim=1)[0]  # (B, H)
        pooled = torch.nan_to_num(pooled, nan=0.0)

        out = self.dropout(F.relu(self.fc1(pooled)))
        logits = self.classifier(out)
        return logits


class BiLSTMClassifier(nn.Module):
    """Bidirectional 2-layer LSTM text classifier capturing forward and backward context."""

    def __init__(
        self,
        vocab_size: int,
        embed_dim: int = 100,
        hidden_dim: int = 128,
        num_classes: int = 6,
        num_layers: int = 2,
        dropout: float = 0.3,
        padding_idx: int = 0,
        pretrained_embeddings: Optional[torch.Tensor] = None,
    ):
        super().__init__()
        self.padding_idx = padding_idx
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=padding_idx)
        if pretrained_embeddings is not None:
            self.embedding.weight.data.copy_(pretrained_embeddings)
        self.embedding.weight.requires_grad = True

        self.lstm = nn.LSTM(
            embed_dim,
            hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )
        self.dropout = nn.Dropout(dropout)
        self.fc1 = nn.Linear(hidden_dim * 2, 64)
        self.classifier = nn.Linear(64, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (batch_size, seq_len)
        mask = (x != self.padding_idx).unsqueeze(-1)  # (B, L, 1)
        embedded = self.dropout(self.embedding(x))  # (B, L, E)
        lstm_out, _ = self.lstm(embedded)  # (B, L, 2*H)

        # Masked max pooling across both directions
        masked_out = lstm_out.masked_fill(~mask, -1e9)
        pooled = torch.max(masked_out, dim=1)[0]  # (B, 2*H)
        pooled = torch.nan_to_num(pooled, nan=0.0)

        out = self.dropout(F.relu(self.fc1(pooled)))
        logits = self.classifier(out)
        return logits


class AttentionBiLSTMClassifier(nn.Module):
    """Attention-Based Bidirectional LSTM text classifier.

    Computes token-level attention distribution over sequential states,
    pooling information dynamically and returning attention weights for inspection.
    """

    def __init__(
        self,
        vocab_size: int,
        embed_dim: int = 100,
        hidden_dim: int = 128,
        num_classes: int = 6,
        num_layers: int = 2,
        dropout: float = 0.3,
        padding_idx: int = 0,
        attn_dim: int = 64,
        pretrained_embeddings: Optional[torch.Tensor] = None,
    ):
        super().__init__()
        self.padding_idx = padding_idx
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=padding_idx)
        if pretrained_embeddings is not None:
            self.embedding.weight.data.copy_(pretrained_embeddings)
        self.embedding.weight.requires_grad = True

        self.lstm = nn.LSTM(
            embed_dim,
            hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )

        # Attention projection
        self.attention_w = nn.Linear(hidden_dim * 2, attn_dim)
        self.attention_v = nn.Linear(attn_dim, 1, bias=False)

        self.dropout = nn.Dropout(dropout)
        self.fc1 = nn.Linear(hidden_dim * 2, 64)
        self.classifier = nn.Linear(64, num_classes)

    def forward(
        self, x: torch.Tensor, return_attention: bool = True
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor]]:
        # x: (batch_size, seq_len)
        mask = (x != self.padding_idx)  # (B, L)
        embedded = self.dropout(self.embedding(x))  # (B, L, E)
        lstm_out, _ = self.lstm(embedded)  # (B, L, 2*H)

        # Compute token attention
        u = torch.tanh(self.attention_w(lstm_out))  # (B, L, attn_dim)
        scores = self.attention_v(u).squeeze(-1)  # (B, L)

        # Mask padding tokens with large negative value before softmax
        scores = scores.masked_fill(~mask, -1e9)
        attn_weights = F.softmax(scores, dim=1)  # (B, L)
        attn_weights = torch.nan_to_num(attn_weights, nan=0.0)

        # Weighted sum context vector: (B, 1, L) @ (B, L, 2*H) -> (B, 2*H)
        context = torch.bmm(attn_weights.unsqueeze(1), lstm_out).squeeze(1)

        out = self.dropout(F.relu(self.fc1(context)))
        logits = self.classifier(out)

        if return_attention:
            return logits, attn_weights
        return logits, None
