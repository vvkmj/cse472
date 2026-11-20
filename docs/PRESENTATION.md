# ShieldText: Academic Presentation Slides

**Course:** CSE472 — Deep Learning for Natural Language Processing  
**Session:** 2026–27  
**Project Title:** ShieldText: An NLP-Based Cyberbullying Detection and Classification System  

---

## Slide 1: Title & Academic Metadata
### ShieldText: An NLP-Based Cyberbullying Detection System
- **Domain:** Natural Language Processing, Deep Learning & Responsible AI
- **Course Outcome Scope:** CO1 to CO6
- **Architecture Overview:** TF-IDF Baselines &bull; Word2Vec Embeddings &bull; PyTorch LSTM/BiLSTM &bull; Additive Self-Attention &bull; DistilBERT Fine-Tuning &bull; FastAPI &bull; React.js
- **Key Insight:** Moving beyond binary toxicity to fine-grained demographic cyberbullying classification while preserving negative contextual sentiment.

---

## Slide 2: Problem Statement & Motivation
### Why Cyberbullying Detection Requires Specialized NLP
- **The Proliferation of Digital Abuse:** Harmful interactions on social networks severely affect mental well-being and community trust.
- **The Flaw of Binary Toxicity Classifiers:** Generic abuse models conflate benign vulgarity (*"The weather is damn terrible"*) with identity-targeted harassment (*"Get out of our school you dumb kid"*).
- **The Trap of Aggressive Stopword Removal:** Traditional preprocessing drops words like `not`, `no`, `never`, completely inverting semantic meaning (*"I am not a bully"* $\rightarrow$ *"bully"*).
- **Objective:** Build an academically sound system that categorizes text across 6 granular categories with model transparency.

---

## Slide 3: CSE472 Course Outcome Alignment
### Complete Coverage from Fundamentals to Transformers

| Outcome | Syllabus Topic | ShieldText Implementation |
|---|---|---|
| **CO1** | Linguistic Foundations & Preprocessing | Negation-preserving stopwords, Porter stemmer, WordNet lemmatizer, emoji translation. |
| **CO2** | Word Embeddings (Word2Vec) | Custom CBOW and Skip-Gram training, semantic similarity, analogies, PCA/t-SNE. |
| **CO3** | Recurrent Sequence Models | PyTorch LSTM and BiLSTM classifiers with masked pooling over variable length text. |
| **CO4** | Attention Mechanisms | Additive self-attention layer over BiLSTM hidden states with token heatmap extraction. |
| **CO5** | Transformer Encoders | DistilBERT sequence classification fine-tuned with AdamW and linear warmup. |
| **CO6** | Evaluation & Responsible AI | Macro F1, confusion matrices, occlusion sensitivity, non-retention privacy safeguards. |

---

## Slide 4: Dataset Selection & Verification
### Wang et al. (2021) Cyberbullying Tweets Dataset
- **Verified Source:** Hugging Face Hub / Kaggle academic repository (`poorvanshi04/cyberbullying_tweets.csv`).
- **Initial Volume:** 47,692 social media posts across 6 balanced categories.
- **Deduplication:** 1,675 exact duplicates eliminated to prevent train-test data leakage.
- **Cleaned Corpus:** 45,749 verified non-empty records partitioned via stratified 70/15/15 split:
  - **Train:** 32,024 records
  - **Validation:** 6,862 records
  - **Test:** 6,863 records
- **Categories:** Religion, Age, Ethnicity, Gender, Other Cyberbullying, Not Cyberbullying (~7,900 samples each).

---

## Slide 5: NLP Preprocessing Pipeline
### Preserving Semantic Integrity & Affective Cues
1. **Entity Normalization:** Replaces `@username` handles and web links with normalized spacing or tokens (`[USER]`, `[URL]`), avoiding overfitting to user handles.
2. **Emoji Demojizing:** Translates emotional emojis into semantic strings (😡 $\rightarrow$ `angry_face`, 🤮 $\rightarrow$ `disgusted_face`).
3. **Punctuation Normalization:** Tailored by model family (stripped for classical n-grams; preserved for transformers).
4. **Negation-Preserving Filtering:** Drops high-frequency function words but retains critical polarity words (`not`, `never`, `no`, `against`, `cannot`).
5. **Morphological Lemmatization:** Employs WordNet lemmatizer to maintain valid dictionary roots.

---

## Slide 6: Distributed Word Vectors (Word2Vec)
### Continuous Semantic Representation Learning
- **Trained on 45,749 domain documents:** Dimension $d=100$, Window $w=5$, Min Count $= 2$, Vocabulary $= 14,890$ words.
- **CBOW (Continuous Bag-of-Words):**
  - Predicts center word given context.
  - Ultra-fast convergence (1.4s), smooth syntactic vector spaces.
- **Skip-Gram (SGNS):**
  - Predicts context words given center target.
  - Superior representation for rare slang, acronyms, and offensive keywords.
- **Geometric Vector Arithmetic:**
  - Semantic nearest neighbors: $\vec{v}(\text{bully}) \sim \text{school, harass, kid, loser}$.
  - Analogies: $\vec{v}(\text{attack}) - \vec{v}(\text{hate}) + \vec{v}(\text{love}) \approx \vec{v}(\text{friend})$.
  - Dimensionality Reduction: 2D t-SNE and PCA coordinate mapping.

---

## Slide 7: Deep Recurrent Sequence Models
### PyTorch LSTM and BiLSTM Architectures
- **Embedding Layer:** Initialized with pretrained Word2Vec weights ($100$-dim), fine-tuneable.
- **Overcoming Pad Degradation:** Standard recurrent states take the last step; when zero-padded to length 80, the hidden state degrades.
- **Masked Max-Pooling Solution:**
  $$h_{\text{pooled}} = \max_{t \in \{t \mid x_t \neq \text{PAD}\}} h_t$$
  Takes the element-wise maximum over valid, non-padded token activations.
- **Bidirectional Advantage:** BiLSTM computes both forward $\vec{h}_t$ and backward $\overleftarrow{h}_t$ trajectories, achieving **84.96% accuracy** on the test set, outperforming unidirectional LSTM (**84.53%**).

---

## Slide 8: Additive Self-Attention BiLSTM
### Dynamic Sequential Pooling & Model Transparency
- **Mechanism:**
  $$u_t = \tanh(W_a h_t + b_a)$$
  $$\alpha_t = \frac{\exp(u_t^T v_a)}{\sum_{k \in \text{valid}} \exp(u_k^T v_a)}$$
  $$c = \sum_{t=1}^L \alpha_t h_t$$
- **Padding Masking:** Softmax input masked with $-10^9$ for pad tokens to enforce zero attention on padding.
- **Test Performance:** **84.10% Accuracy**, **0.8330 Macro F1**.
- **Interpretability:** Returns token attention weights $\alpha_t \in [0, 1]$ directly to the web UI for interactive heatmap rendering.

---

## Slide 9: Transformer Encoders (DistilBERT)
### Bidirectional Self-Attention & Subword Representations
- **Pretrained Architecture:** `distilbert-base-uncased` (6 transformer layers, 768 hidden dimension, 12 attention heads, 66M parameters).
- **Subword WordPiece Tokenization:** Handles out-of-vocabulary slang and creative misspellings via subwords.
- **Fine-Tuning:**
  - Optimization: AdamW ($\text{LR} = 3 \times 10^{-5}$, weight decay $= 0.01$).
  - Linear warmup over initial 10% steps.
  - Cross-entropy loss on downstream 6-class head.
- **Test Set Accuracy:** **78.20% Accuracy**, **0.7218 Macro F1**.

---

## Slide 10: Empirical Results & Benchmark Leaderboard
### Performance on 6,863 Stratified Held-Out Test Samples

| Architecture | Accuracy | Macro F1 | Weighted F1 | Inference Speed |
|---|:---:|:---:|:---:|:---:|
| **Bidirectional LSTM** | **84.96%** | **0.8404** | **0.8436** | ~2.5 ms/sample |
| **Unidirectional LSTM** | 84.53% | 0.8349 | 0.8398 | ~1.8 ms/sample |
| **Attention-Based BiLSTM** | 84.10% | 0.8330 | 0.8365 | ~3.0 ms/sample |
| **Logistic Regression (TF-IDF)** | 84.00% | 0.8310 | 0.8354 | ~0.2 ms/sample |
| **Linear SVM (TF-IDF)** | 83.46% | 0.8242 | 0.8291 | ~0.1 ms/sample |
| **Word2Vec Skip-Gram** | 78.54% | 0.7697 | 0.7788 | ~0.8 ms/sample |
| **Word2Vec CBOW** | 78.49% | 0.7717 | 0.7792 | ~0.8 ms/sample |
| **Fine-Tuned DistilBERT** | 78.20% | 0.7218 | 0.7634 | ~12 ms/sample |

- **Top Model:** BiLSTM with masked max-pooling provides the best balance of accuracy and sequential modeling.

---

## Slide 11: Full-Stack Web Application (ShieldText)
### Production-Grade Demonstrable System
- **Backend Architecture:** Asynchronous FastAPI server (`/api/predict`, `/api/batch`, `/api/metrics`, `/api/visualizations`).
- **Frontend Architecture:** React.js + Tailwind CSS + Recharts interactive dashboard.
- **Page Capabilities:**
  1. **Dashboard:** Corpus metrics, architecture highlights, leaderboard.
  2. **Live Detection:** Instant multi-class inference, probability bars, token attention heatmap.
  3. **Batch Analysis:** CSV upload, column auto-detection, progress tracking, and CSV export.
  4. **Model Comparison:** Multi-metric bar charts and 6x6 interactive confusion matrices.
  5. **NLP Visualizations:** 2D PCA/t-SNE scatter plots and preprocessing breakdown.
  6. **Academic Documentation:** Course outcome alignment (CO1-CO6) and ethical guidelines.

---

## Slide 12: Responsible AI, Limitations & Conclusion
### Ethical Governance & Summary
- **Decision-Support Guardrails:** Model predictions inform human moderators; automated account suspensions or bans are prohibited.
- **Privacy Assurance:** Zero user input retention; inference executes strictly in-memory.
- **System Limitations:** Sarcasm, cultural slang, and code-mixed vernacular require ongoing human review.
- **Future Work:** Multi-turn conversational thread context and multilingual adaptation (XLM-RoBERTa).
- **Summary:** ShieldText delivers a rigorous, academically aligned, and technically complete NLP system for automated cyberbullying detection.

