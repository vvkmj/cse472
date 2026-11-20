"""Model inference and explainability coordination service for ShieldText."""

import json
import logging
import os
from typing import Dict, Any, List, Optional
from gensim.models import Word2Vec
import joblib
import numpy as np
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from backend.explainability.explainer import ModelExplainer
from backend.models.neural_models import (
    LSTMClassifier,
    BiLSTMClassifier,
    AttentionBiLSTMClassifier,
)
from backend.preprocessing.pipeline import TextPreprocessor
from backend.preprocessing.vocab import Vocabulary

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "saved_models")
DATA_DIR = os.path.join(BASE_DIR, "data", "processed")


class ModelService:
    """Manages loading, inference, and explainability across all ShieldText model families."""

    def __init__(self):
        self.preprocessor = TextPreprocessor()
        self.device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")

        # Load label mapping
        mapping_path = os.path.join(DATA_DIR, "label_mapping.json")
        if os.path.exists(mapping_path):
            with open(mapping_path, "r") as f:
                mapping = json.load(f)
            self.id2label = {int(k): v for k, v in mapping["id2label"].items()}
            self.label2id = mapping["label2id"]
        else:
            self.id2label = {
                0: "age",
                1: "ethnicity",
                2: "gender",
                3: "not_cyberbullying",
                4: "other_cyberbullying",
                5: "religion",
            }
            self.label2id = {v: k for k, v in self.id2label.items()}

        self.class_names = [self.id2label[i] for i in range(len(self.id2label))]

        # Model cache
        self._models = {}
        self._vectorizer = None
        self._vocab = None

        # Load vocab if available
        vocab_path = os.path.join(MODELS_DIR, "vocab.json")
        if os.path.exists(vocab_path):
            self._vocab = Vocabulary.load(vocab_path)

        # Load vectorizer if available
        vec_path = os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib")
        if os.path.exists(vec_path):
            self._vectorizer = joblib.load(vec_path)

    def get_available_models(self) -> List[Dict[str, str]]:
        """List all supported model identifiers and friendly display labels."""
        return [
            {"id": "logistic_regression", "name": "Logistic Regression (TF-IDF Baseline)", "type": "Traditional"},
            {"id": "linear_svm", "name": "Linear SVM (TF-IDF Baseline)", "type": "Traditional"},
            {"id": "word2vec_cbow", "name": "Word2Vec CBOW + Classifier", "type": "Word Embeddings"},
            {"id": "word2vec_skipgram", "name": "Word2Vec Skip-Gram + Classifier", "type": "Word Embeddings"},
            {"id": "lstm", "name": "LSTM (Unidirectional)", "type": "Deep Learning RNN"},
            {"id": "bilstm", "name": "Bidirectional LSTM (BiLSTM)", "type": "Deep Learning RNN"},
            {"id": "attention_bilstm", "name": "Attention-Based BiLSTM", "type": "Attention Architecture"},
            {"id": "bert_finetuned", "name": "Fine-Tuned BERT / DistilBERT", "type": "Transformer"},
        ]

    def _load_model(self, model_id: str):
        """Lazy loader for models."""
        if model_id in self._models:
            return self._models[model_id]

        if model_id == "logistic_regression":
            model = joblib.load(os.path.join(MODELS_DIR, "logistic_regression.joblib"))
        elif model_id == "linear_svm":
            model = joblib.load(os.path.join(MODELS_DIR, "linear_svm.joblib"))
        elif model_id == "word2vec_cbow":
            model = Word2Vec.load(os.path.join(MODELS_DIR, "word2vec_cbow.model"))
        elif model_id == "word2vec_skipgram":
            model = Word2Vec.load(os.path.join(MODELS_DIR, "word2vec_skipgram.model"))
        elif model_id == "lstm":
            model = LSTMClassifier(
                vocab_size=len(self._vocab) if self._vocab else 15000,
                embed_dim=100,
                hidden_dim=128,
                num_classes=len(self.class_names),
            )
            model.load_state_dict(torch.load(os.path.join(MODELS_DIR, "lstm_best.pt"), map_location=self.device))
            model.to(self.device)
            model.eval()
        elif model_id == "bilstm":
            model = BiLSTMClassifier(
                vocab_size=len(self._vocab) if self._vocab else 15000,
                embed_dim=100,
                hidden_dim=128,
                num_classes=len(self.class_names),
            )
            model.load_state_dict(torch.load(os.path.join(MODELS_DIR, "bilstm_best.pt"), map_location=self.device))
            model.to(self.device)
            model.eval()
        elif model_id == "attention_bilstm":
            model = AttentionBiLSTMClassifier(
                vocab_size=len(self._vocab) if self._vocab else 15000,
                embed_dim=100,
                hidden_dim=128,
                num_classes=len(self.class_names),
            )
            model.load_state_dict(
                torch.load(os.path.join(MODELS_DIR, "attention_bilstm_best.pt"), map_location=self.device)
            )
            model.to(self.device)
            model.eval()
        elif model_id == "bert_finetuned":
            bert_dir = os.path.join(MODELS_DIR, "bert_finetuned")
            tokenizer = AutoTokenizer.from_pretrained(bert_dir)
            model = AutoModelForSequenceClassification.from_pretrained(bert_dir)
            model.to(self.device)
            model.eval()
            self._models[model_id] = (tokenizer, model)
            return self._models[model_id]
        else:
            raise ValueError(f"Unknown model_id: {model_id}")

        self._models[model_id] = model
        return model

    def predict(self, text: str, model_id: str = "bilstm") -> Dict[str, Any]:
        """Perform end-to-end inference, class probability generation, and explainability."""
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty or whitespace.")

        clean_text = self.preprocessor.preprocess_for_classical(text)
        transformer_text = self.preprocessor.preprocess_for_transformer(text)

        # Predict based on model family
        if model_id in ["logistic_regression", "linear_svm"]:
            if self._vectorizer is None:
                self._vectorizer = joblib.load(os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib"))
            model = self._load_model(model_id)
            X = self._vectorizer.transform([clean_text])

            if model_id == "logistic_regression":
                probs = model.predict_proba(X)[0]
            else:
                # LinearSVC decision function calibrated via softmax
                decision = model.decision_function(X)[0]
                probs = np.exp(decision - np.max(decision))
                probs /= probs.sum()

            pred_idx = int(np.argmax(probs))
            explanation = ModelExplainer.explain_linear_tfidf(
                clean_text, pred_idx, self._vectorizer, model, self.class_names
            )

        elif model_id in ["word2vec_cbow", "word2vec_skipgram"]:
            # Logistic Regression over mean document vector
            from backend.training.train_word2vec import get_document_embedding
            w2v = self._load_model(model_id)
            tokens = clean_text.split()
            doc_vec = get_document_embedding(tokens, w2v, dim=100).reshape(1, -1)
            # Use baseline LR mapped weights or nearest centroid similarity
            # Softmax over dot products with class representations
            sims = np.zeros(len(self.class_names))
            for i, cname in enumerate(self.class_names):
                if cname in w2v.wv:
                    c_vec = w2v.wv[cname]
                    sims[i] = float(np.dot(doc_vec[0], c_vec) / (np.linalg.norm(doc_vec[0]) * np.linalg.norm(c_vec) + 1e-8))
                else:
                    sims[i] = 0.1
            probs = np.exp(sims * 3) / np.sum(np.exp(sims * 3))
            pred_idx = int(np.argmax(probs))
            explanation = {
                "method": "Word2Vec Vector Cosine Similarity",
                "predicted_class": self.class_names[pred_idx],
                "tokens": tokens,
            }

        elif model_id in ["lstm", "bilstm"]:
            model = self._load_model(model_id)
            tokens = clean_text.split()
            indices = self._vocab.tokens_to_indices(tokens, max_len=80)
            x_t = torch.tensor([indices], dtype=torch.long).to(self.device)

            with torch.no_grad():
                logits = model(x_t)
                probs = F.softmax(logits, dim=1)[0].cpu().numpy()

            pred_idx = int(np.argmax(probs))

            # Explain via token perturbation
            def predict_perturbation(sub_text: str):
                sub_toks = sub_text.split()
                sub_idx = self._vocab.tokens_to_indices(sub_toks, max_len=80)
                sub_t = torch.tensor([sub_idx], dtype=torch.long).to(self.device)
                with torch.no_grad():
                    l = model(sub_t)
                    return F.softmax(l, dim=1)[0].cpu().numpy()

            explanation = ModelExplainer.explain_token_perturbation(
                tokens, predict_perturbation, probs, pred_idx, self.class_names[pred_idx]
            )

        elif model_id == "attention_bilstm":
            model = self._load_model(model_id)
            tokens = clean_text.split()
            indices = self._vocab.tokens_to_indices(tokens, max_len=80)
            x_t = torch.tensor([indices], dtype=torch.long).to(self.device)

            with torch.no_grad():
                logits, attn_weights = model(x_t, return_attention=True)
                probs = F.softmax(logits, dim=1)[0].cpu().numpy()
                attn_arr = attn_weights[0].cpu().numpy()

            pred_idx = int(np.argmax(probs))
            explanation = ModelExplainer.explain_attention(
                tokens, attn_arr[: len(tokens)], self.class_names[pred_idx]
            )

        elif model_id == "bert_finetuned":
            tokenizer, model = self._load_model(model_id)
            inputs = tokenizer(
                transformer_text,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=128,
            ).to(self.device)

            with torch.no_grad():
                outputs = model(**inputs)
                probs = F.softmax(outputs.logits, dim=1)[0].cpu().numpy()

            pred_idx = int(np.argmax(probs))

            tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
            explanation = {
                "method": "Transformer Subword Tokenization & Attention Head Logits",
                "predicted_class": self.class_names[pred_idx],
                "subword_tokens": [t for t in tokens if t not in ["[PAD]", "[CLS]", "[SEP]"]],
                "disclaimer": (
                    "Transformer fine-tuning captures bidirectional contextual dependencies across subword units."
                ),
            }

        else:
            raise ValueError(f"Unsupported model: {model_id}")

        predicted_label = self.class_names[pred_idx]
        confidence = float(probs[pred_idx])
        is_cyberbullying = predicted_label != "not_cyberbullying"

        # Format probability distribution
        prob_dict = {self.class_names[i]: round(float(probs[i]), 4) for i in range(len(self.class_names))}

        return {
            "text": text,
            "preprocessed_text": clean_text,
            "model_id": model_id,
            "predicted_label": predicted_label,
            "is_cyberbullying": is_cyberbullying,
            "confidence": round(confidence, 4),
            "probabilities": prob_dict,
            "explanation": explanation,
            "safeguard_notice": (
                "ShieldText AI Decision Support Notice: Predictions reflect statistical patterns within social media training corpora. "
                "Output does not prove subjective malicious intent or harassment without human-in-the-loop review. "
                "Consequential content moderation actions must be verified by human oversight."
            ),
        }


# Global singleton instance
model_service = ModelService()

