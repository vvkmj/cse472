"""Explainability module for ShieldText.

Implements feature attribution for TF-IDF linear baselines, attention weight extraction
for Attention-BiLSTM, and token-level occlusion/perturbation sensitivity for deep learning architectures.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import torch


class ModelExplainer:
    """Provides interpretable explanations for ShieldText model predictions."""

    @staticmethod
    def explain_linear_tfidf(
        text: str,
        predicted_class_id: int,
        vectorizer,
        model,
        class_names: List[str],
        top_k: int = 10,
    ) -> Dict[str, Any]:
        """Explain linear model predictions using token TF-IDF weights multiplied by class coefficients."""
        feature_names = vectorizer.get_feature_names_out()
        vocab_lookup = {feat: idx for idx, feat in enumerate(feature_names)}

        # Tokenize and extract n-grams
        analyzer = vectorizer.build_analyzer()
        tokens = analyzer(text)

        class_coefs = model.coef_[predicted_class_id]

        attributions = []
        for t in tokens:
            if t in vocab_lookup:
                feat_idx = vocab_lookup[t]
                weight = float(class_coefs[feat_idx])
                attributions.append({"token": t, "importance": round(weight, 4)})

        # Sort by importance descending
        attributions.sort(key=lambda x: x["importance"], reverse=True)

        return {
            "method": "TF-IDF Feature Coefficient Attribution",
            "predicted_class": class_names[predicted_class_id],
            "token_attributions": attributions[:top_k],
            "disclaimer": (
                "Feature importance reflects statistical correlation within the training corpus "
                "and does not constitute proof of subjective user intent."
            ),
        }

    @staticmethod
    def explain_attention(
        tokens: List[str],
        attention_weights: np.ndarray,
        predicted_class_name: str,
        top_k: int = 10,
    ) -> Dict[str, Any]:
        """Format token-level attention weights for Attention-BiLSTM."""
        token_attns = []
        # Match tokens up to length
        valid_len = min(len(tokens), len(attention_weights))
        for i in range(valid_len):
            token_attns.append(
                {"token": tokens[i], "attention_weight": round(float(attention_weights[i]), 4)}
            )

        # Sort for top contributors
        ranked = sorted(token_attns, key=lambda x: x["attention_weight"], reverse=True)

        return {
            "method": "BiLSTM Additive Self-Attention Weights",
            "predicted_class": predicted_class_name,
            "all_tokens_with_weights": token_attns,
            "top_attended_tokens": ranked[:top_k],
            "disclaimer": (
                "Self-attention highlights tokens prioritized during sequential representation pooling. "
                "Attention weights represent internal model dynamics rather than complete causal explanations."
            ),
        }

    @staticmethod
    def explain_token_perturbation(
        tokens: List[str],
        predict_fn,
        baseline_probs: np.ndarray,
        predicted_class_idx: int,
        predicted_class_name: str,
        top_k: int = 10,
    ) -> Dict[str, Any]:
        """Explain model prediction via occlusion/perturbation sensitivity (leave-one-token-out)."""
        base_confidence = float(baseline_probs[predicted_class_idx])
        token_impacts = []

        for i, token in enumerate(tokens):
            # Create perturbed sentence without token i
            perturbed_tokens = tokens[:i] + tokens[i + 1 :]
            if not perturbed_tokens:
                continue

            perturbed_text = " ".join(perturbed_tokens)
            perturbed_probs = predict_fn(perturbed_text)
            perturbed_conf = float(perturbed_probs[predicted_class_idx])

            # Drop in confidence indicates token was supporting the prediction
            importance = base_confidence - perturbed_conf
            token_impacts.append(
                {
                    "token": token,
                    "importance": round(importance, 4),
                    "confidence_without_token": round(perturbed_conf, 4),
                }
            )

        ranked = sorted(token_impacts, key=lambda x: x["importance"], reverse=True)

        return {
            "method": "Token Occlusion Sensitivity",
            "predicted_class": predicted_class_name,
            "baseline_confidence": round(base_confidence, 4),
            "token_impacts": ranked[:top_k],
            "all_tokens": token_impacts,
            "disclaimer": (
                "Occlusion sensitivity measures confidence variance when removing individual tokens. "
                "It serves as decision support and does not infer individual intent."
            ),
        }

