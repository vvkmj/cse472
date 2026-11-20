"""NLP Preprocessing Pipeline for ShieldText.

Implements modular text cleaning, normalization, tokenization,
stopword removal, stemming, lemmatization, emoji translation,
and sequence preparation for classical and deep learning models.
"""

import os
import re
import string
from typing import List, Dict, Any, Optional
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer, WordNetLemmatizer
from nltk.tokenize import word_tokenize

# Add local project nltk_data path
LOCAL_NLTK_DATA = os.path.abspath(
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "nltk_data")
)
if os.path.exists(LOCAL_NLTK_DATA) and LOCAL_NLTK_DATA not in nltk.data.path:
    nltk.data.path.insert(0, LOCAL_NLTK_DATA)


class TextPreprocessor:
    """Modular NLP text preprocessor for social media text and cyberbullying classification."""

    def __init__(self):
        # Ensure NLTK resources
        try:
            self.stop_words = set(stopwords.words("english"))
        except LookupError:
            nltk.download("stopwords", quiet=True)
            self.stop_words = set(stopwords.words("english"))

        try:
            self.lemmatizer = WordNetLemmatizer()
            _ = self.lemmatizer.lemmatize("testing")
        except LookupError:
            nltk.download("wordnet", quiet=True)
            self.lemmatizer = WordNetLemmatizer()

        self.stemmer = PorterStemmer()

        # Emoji to semantic description dictionary for common social media expressions
        self.emoji_map = {
            "😡": " angry_face ",
            "🤬": " swearing_face ",
            "🤮": " disgusted_face ",
            "🤡": " clown_face ",
            "💀": " skull ",
            "🖕": " middle_finger ",
            "👎": " thumbs_down ",
            "💔": " broken_heart ",
            "😂": " laughing_tears ",
            "❤️": " love_heart ",
            "👍": " thumbs_up ",
            "🙏": " folded_hands ",
            "😭": " crying_face ",
            "🔥": " fire ",
            "🤢": " nauseated_face ",
            "👊": " fist_bump ",
        }

    def handle_emojis(self, text: str) -> str:
        """Translate key emotional emojis into textual descriptors to preserve affective tone."""
        for emoji_char, replacement in self.emoji_map.items():
            text = text.replace(emoji_char, replacement)
        # Remove remaining uncategorized unicode emoji symbols
        text = re.sub(r"[\U00010000-\U0010ffff]", " ", text)
        return text

    def clean_text(
        self,
        text: str,
        lower: bool = True,
        remove_urls: bool = True,
        handle_mentions: bool = True,
        handle_hashtags: bool = True,
        handle_emojis_flag: bool = True,
        remove_punct: bool = True,
    ) -> str:
        """Apply foundational text cleaning and noise elimination."""
        if not isinstance(text, str):
            return ""

        # 1. HTML entities and tags
        cleaned = re.sub(r"&[a-zA-Z]+;", " ", text)
        cleaned = re.sub(r"<[^>]+>", " ", cleaned)

        # 2. URLs
        if remove_urls:
            cleaned = re.sub(r"https?://\S+|www\.\S+", " ", cleaned)

        # 3. User mentions (@user)
        if handle_mentions:
            # Replace user mentions with a normalized token or blank space
            cleaned = re.sub(r"@\w+", " ", cleaned)

        # 4. Hashtags (#topic -> topic)
        if handle_hashtags:
            cleaned = re.sub(r"#(\w+)", r" \1 ", cleaned)

        # 5. Emoji handling
        if handle_emojis_flag:
            cleaned = self.handle_emojis(cleaned)

        # 6. Lowercasing
        if lower:
            cleaned = cleaned.lower()

        # 7. Punctuation handling
        if remove_punct:
            cleaned = cleaned.translate(str.maketrans("", "", string.punctuation))

        # 8. Extra whitespace and non-printable characters
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    def tokenize(self, text: str) -> List[str]:
        """Tokenize cleaned text into tokens."""
        if not text:
            return []
        try:
            return word_tokenize(text)
        except Exception:
            # Fallback regex whitespace tokenization if punkt table is unreadable
            return text.split()

    def remove_stopwords(
        self, tokens: List[str], preserve_negations: bool = True
    ) -> List[str]:
        """Filter out stopwords while optionally preserving crucial negation terms.

        Crucial Note: Preserving words like 'not', 'no', 'never', 'against' is
        critical in cyberbullying detection to prevent sentiment and intent inversion.
        """
        negations = {"not", "no", "nor", "neither", "never", "none", "cannot", "against"}
        active_stopwords = self.stop_words - negations if preserve_negations else self.stop_words
        return [t for t in tokens if t not in active_stopwords]

    def stem_tokens(self, tokens: List[str]) -> List[str]:
        """Apply Porter Stemming to reduce tokens to morphological stems."""
        return [self.stemmer.stem(t) for t in tokens]

    def lemmatize_tokens(self, tokens: List[str]) -> List[str]:
        """Apply WordNet Lemmatization to reduce tokens to valid dictionary roots."""
        return [self.lemmatizer.lemmatize(t) for t in tokens]

    def preprocess_for_classical(
        self, text: str, use_stemming: bool = False
    ) -> str:
        """Full pipeline for classical models (BoW, TF-IDF, Word2Vec averages).

        Steps: clean -> lowercase -> remove punct -> tokenize -> remove stopwords (with negation preservation) -> lemmatize/stem.
        """
        cleaned = self.clean_text(
            text,
            lower=True,
            remove_urls=True,
            handle_mentions=True,
            handle_hashtags=True,
            handle_emojis_flag=True,
            remove_punct=True,
        )
        tokens = self.tokenize(cleaned)
        tokens = self.remove_stopwords(tokens, preserve_negations=True)
        if use_stemming:
            tokens = self.stem_tokens(tokens)
        else:
            tokens = self.lemmatize_tokens(tokens)
        return " ".join(tokens)

    def preprocess_for_transformer(self, text: str) -> str:
        """Pipeline for Transformer models (BERT).

        Preserves punctuation, casing subtleties, sentence structure, and negations
        since pretrained subword tokenizers (WordPiece) and self-attention rely
        on bidirectional contextual cues.
        """
        # We normalize URLs and mentions, but preserve casing, punctuation, and structural flow
        cleaned = re.sub(r"&[a-zA-Z]+;", " ", text)
        cleaned = re.sub(r"<[^>]+>", " ", cleaned)
        cleaned = re.sub(r"https?://\S+|www\.\S+", " [URL] ", cleaned)
        cleaned = re.sub(r"@\w+", " [USER] ", cleaned)
        cleaned = re.sub(r"#(\w+)", r"\1", cleaned)
        cleaned = self.handle_emojis(cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    def get_before_after_demonstration(self, sample_text: Optional[str] = None) -> Dict[str, Any]:
        """Provide safe educational before-and-after demonstration of the preprocessing pipeline."""
        if sample_text is None:
            sample_text = (
                "Hey @alex! Check this out: https://example.com/test #TeamSpirit... "
                "You are definitely not qualified for this project 😡👎!! #epicfail"
            )

        step1_cleaned_urls_mentions = self.clean_text(
            sample_text, lower=False, remove_urls=True, handle_mentions=True, handle_hashtags=True, handle_emojis_flag=True, remove_punct=False
        )
        step2_lowercased = step1_cleaned_urls_mentions.lower()
        step3_punct_removed = self.clean_text(
            sample_text, lower=True, remove_urls=True, handle_mentions=True, handle_hashtags=True, handle_emojis_flag=True, remove_punct=True
        )
        step4_tokens = self.tokenize(step3_punct_removed)
        step5_no_stopwords = self.remove_stopwords(step4_tokens, preserve_negations=True)
        step6_lemmatized = self.lemmatize_tokens(step5_no_stopwords)
        step7_stemmed = self.stem_tokens(step5_no_stopwords)

        return {
            "original_text": sample_text,
            "step1_url_mention_emoji_normalized": step1_cleaned_urls_mentions,
            "step2_lowercased": step2_lowercased,
            "step3_punct_removed": step3_punct_removed,
            "step4_tokens": step4_tokens,
            "step5_stopwords_filtered_preserving_negation": step5_no_stopwords,
            "step6_lemmatized": step6_lemmatized,
            "step7_stemmed": step7_stemmed,
            "classical_pipeline_output": " ".join(step6_lemmatized),
            "transformer_pipeline_output": self.preprocess_for_transformer(sample_text),
        }

    @staticmethod
    def explain_preprocessing_tradeoffs() -> Dict[str, str]:
        """Academic explanation of why certain preprocessing operations can be harmful."""
        return {
            "Aggressive Stop-Word Removal": (
                "Standard stop-word lists drop words like 'not', 'no', 'never', 'against', and 'why'. "
                "In harmful language detection, stripping negations completely inverts semantics "
                "(e.g., 'not a bully' becomes 'bully', causing severe false positive inflation). "
                "ShieldText utilizes negation-preserving stopword filtering."
            ),
            "Stemming vs. Lemmatization": (
                "Stemmers (such as PorterStemmer) apply heuristic suffix truncation, producing non-words "
                "(e.g., 'community' -> 'commun', 'university' -> 'univers'). Lemmatization maps words to "
                "valid dictionary lemmas using morphological and lexical vocabulary (WordNet), preserving "
                "interpretability and semantic validity for embeddings."
            ),
            "Punctuation Stripping in Deep Models": (
                "While removing punctuation reduces vocabulary size for sparse Bag-of-Words/TF-IDF models, "
                "transformers like BERT rely on punctuation (question marks, exclamation points, quotation marks) "
                "to understand conversational syntax, emotional escalation, rhetorical sarcasm, and sentence boundaries."
            ),
            "Emoji and Social Shorthand Loss": (
                "Simply deleting non-ASCII characters discards crucial sentiment indicators (e.g., 😡, 🤮, 💀). "
                "ShieldText translates common affective emojis into semantic token representations ('angry_face', 'disgusted_face') "
                "before vocabulary mapping."
            ),
        }
