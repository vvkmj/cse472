# ShieldText: An NLP-Based Cyberbullying Detection & Classification System

[![Course: CSE472](https://img.shields.io/badge/Course-CSE472%20Deep%20Learning%20for%20NLP-blue.svg)](https://github.com)
[![Session: 2026-27](https://img.shields.io/badge/Session-2026--27-indigo.svg)](https://github.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.15%20(MPS%20Accelerated)-EE4C2C.svg)](https://pytorch.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-1.0.0-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![Tests: 13 Passed](https://img.shields.io/badge/Pytest-13%20Passed-success.svg)](https://pytest.org)

ShieldText is a comprehensive, functional, and academically defensible Natural Language Processing (NLP) and Deep Learning system designed for **CSE472 — Deep Learning for Natural Language Processing** (Academic Session 2026–27). 

ShieldText classifies social media comments and conversations into six distinct categories: **Age**, **Ethnicity**, **Gender**, **Religion**, **Other Cyberbullying**, and **Not Cyberbullying**, distinguishing ordinary negative language from identity-targeted digital harassment.

---

## 🌟 Key Features

1. **Linguistic Preprocessing Pipeline (CO1):** Handles URLs, user handles, hashtags, and translates emotional emojis into descriptive tokens while **strictly preserving negation words** (`not`, `no`, `never`, `nor`) to prevent semantic inversion.
2. **Word Embeddings (CO2):** In-domain Word2Vec models (CBOW and Skip-Gram), nearest-neighbor cosine similarity lookups, vector analogy experiments, and interactive 2D PCA & t-SNE projections.
3. **Deep Recurrent Sequence Modeling (CO3):** PyTorch LSTM and Bidirectional LSTM (BiLSTM) classifiers with Word2Vec weight initialization and **masked max-pooling** over variable-length sequences.
4. **Additive Self-Attention Mechanism (CO4):** Attention-based BiLSTM computing dynamically weighted sequence context vectors and exposing token-level attention heatmaps for interpretability.
5. **Transformer Encoders (CO5):** Pretrained DistilBERT sequence classifier fine-tuned with AdamW and linear learning rate warmup.
6. **Interpretability & Explainability:** Token-level occlusion sensitivity (leave-one-token-out), TF-IDF class coefficients, and attention distributions.
7. **Interactive Full-Stack Web Application:** Modern React.js + Tailwind CSS + Recharts user interface backed by an asynchronous FastAPI REST server.
8. **Batch CSV Processing:** Upload CSV files, auto-detect text columns, run high-throughput batch classification, and export annotated results.
9. **Responsible AI Safeguards (CO6):** Human-in-the-loop decision support badge, non-retention ephemeral RAM processing, and explicit warnings against automated punitive actions.

---

## 📊 Empirical Test Set Results (N = 6,863 held-out samples)

All models are trained on the Wang et al. (2021) Cyberbullying Tweets dataset (45,749 deduplicated records) and evaluated on the exact same stratified test split:

| Model Architecture | Accuracy | Macro Precision | Macro Recall | Macro F1 | Weighted F1 |
|---|:---:|:---:|:---:|:---:|:---:|
| **Bidirectional LSTM (BiLSTM)** | **84.96%** | **84.81%** | **84.58%** | **0.8404** | **0.8436** |
| **LSTM (Unidirectional)** | 84.53% | 84.42% | 84.11% | 0.8349 | 0.8398 |
| **Attention-Based BiLSTM** | 84.10% | 83.95% | 83.74% | 0.8330 | 0.8365 |
| **Logistic Regression (TF-IDF)** | 84.00% | 83.75% | 83.63% | 0.8310 | 0.8354 |
| **Linear SVM (TF-IDF)** | 83.46% | 83.21% | 83.05% | 0.8242 | 0.8291 |
| **Word2Vec Skip-Gram + Classifier** | 78.54% | 77.82% | 77.45% | 0.7697 | 0.7788 |
| **Word2Vec CBOW + Classifier** | 78.49% | 78.01% | 77.58% | 0.7717 | 0.7792 |
| **Fine-Tuned DistilBERT** | 78.20% | 78.10% | 74.30% | 0.7218 | 0.7634 |

---

## 🏛️ Project Directory Structure

```text
cse472_ca/
│
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry point
│   │   ├── routes/                  # API endpoints (predict, batch, metrics, visualizations, info)
│   │   ├── services/                # Model inference & lazy-loading service
│   │   ├── models/                  # PyTorch LSTM, BiLSTM, and Attention-BiLSTM
│   │   └── schemas/                 # Pydantic request & response validation
│   │
│   ├── preprocessing/
│   │   ├── pipeline.py              # Modular text cleaning, emojis & negation preservation
│   │   ├── vocab.py                 # Vocabulary, OOV handling & sequence padding
│   │   └── dataset_prep.py          # Deduplication & stratified splitting
│   │
│   ├── training/
│   │   ├── train_baseline.py        # TF-IDF, Logistic Regression, Linear SVM
│   │   ├── train_word2vec.py        # CBOW & Skip-Gram training + PCA/t-SNE
│   │   ├── train_neural.py          # PyTorch LSTM, BiLSTM, Attention-BiLSTM
│   │   └── train_bert.py            # DistilBERT transformer fine-tuning
│   │
│   ├── evaluation/
│   │   └── metrics.py               # Macro/Weighted F1, confusion matrices, class reports
│   ├── explainability/
│   │   └── explainer.py             # Feature attribution, attention weights & occlusion
│   └── utils/
│       └── download_data.py         # Automated dataset download & verification
│
├── frontend/                        # React.js + Tailwind CSS + Recharts
│   ├── src/
│   │   ├── pages/                   # Dashboard, LiveDetection, BatchAnalysis, ModelComparison, etc.
│   │   ├── App.jsx                  # Main navigation shell
│   │   └── main.jsx                 # React root mount
│   ├── package.json
│   └── vite.config.js
│
├── data/
│   ├── raw/                         # Raw cyberbullying_tweets.csv (Wang et al. 2021)
│   ├── processed/                   # Stratified train.csv, val.csv, test.csv, label_mapping.json
│   └── nltk_data/                   # Self-contained NLTK resources
│
├── experiments/                     # 4 Executable Jupyter Notebooks
│   ├── preprocessing.ipynb
│   ├── word_embeddings.ipynb
│   ├── lstm_training.ipynb
│   └── bert_finetuning.ipynb
│
├── saved_models/                    # Trained model checkpoints, vocab, and evaluation metrics
├── tests/                           # Pytest unit & integration test suite (13 tests)
├── docs/                            # Comprehensive academic documentation
│   ├── PROJECT_REPORT.md            # Detailed 19-section academic project report
│   ├── PRESENTATION.md              # 12-slide academic defense presentation
│   └── VIVA_QUESTIONS.md            # 35 in-depth viva voce questions & answers
│
├── requirements.txt
├── PROJECT_COMPLETION_REPORT.md
└── README.md
```

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ and npm
- macOS (Apple Silicon MPS), Linux (CUDA), or Windows (CPU/CUDA)

### 2. Environment Setup
```bash
# Clone or navigate into the workspace
cd cse472_ca

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Download required NLTK resources into local project folder
python -c "import nltk, os; dest=os.path.abspath('data/nltk_data'); os.makedirs(dest, exist_ok=True); nltk.download('punkt', download_dir=dest); nltk.download('punkt_tab', download_dir=dest); nltk.download('stopwords', download_dir=dest); nltk.download('wordnet', download_dir=dest)"
```

### 3. Dataset Download & Preprocessing
```bash
# Download and verify Wang et al. 2021 dataset (47,692 tweets)
python backend/utils/download_data.py

# Clean, deduplicate, and generate stratified train/val/test splits
PYTHONPATH=. python backend/preprocessing/dataset_prep.py
```

### 4. Training All Models
The repository includes pre-trained model checkpoints in `saved_models/`. To reproduce training from scratch:
```bash
# 1. Train traditional baselines (TF-IDF + Logistic Regression & Linear SVM)
PYTHONPATH=. python backend/training/train_baseline.py

# 2. Train Word2Vec CBOW & Skip-Gram models + compute PCA/t-SNE coordinates
PYTHONPATH=. python backend/training/train_word2vec.py

# 3. Train PyTorch neural sequence models (LSTM, BiLSTM, Attention-BiLSTM)
PYTHONPATH=. python backend/training/train_neural.py --epochs 4

# 4. Fine-tune DistilBERT transformer
PYTHONPATH=. python backend/training/train_bert.py --quick
```

### 5. Running Tests
```bash
PYTHONPATH=. pytest tests/test_api_and_models.py -v
```
All 13 unit tests will execute and verify the preprocessing pipeline, vocabulary mapping, model loading, live inference, and API endpoints.

---

## 💻 Running the Application

### Option A: Unified Full-Stack Server (Recommended)
The React frontend is compiled and statically served directly by the FastAPI backend:
```bash
PYTHONPATH=. .venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
Open your browser at:
- **Web Application:** [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Option B: Standalone Frontend Dev Server (Vite)
If you wish to edit frontend components live with hot-module replacement (HMR):
```bash
# In terminal 1 (Backend):
PYTHONPATH=. .venv/bin/uvicorn backend.app.main:app --port 8000

# In terminal 2 (Frontend):
cd frontend
npm run dev
```
Access the Vite dev server at [http://localhost:3000](http://localhost:3000).

---

## 🛡️ Responsible AI & Ethical Safeguards

1. **Decision Support, Not Automated Sanction:** ShieldText is explicitly built as an assistant for human moderators. Predictions must never trigger automated suspensions or account termination without human oversight.
2. **Ephemeral RAM Processing (Non-Retention):** User texts submitted via the live interface or batch CSV uploads are evaluated transiently in memory and are never serialized, logged, or saved to persistent disk.
3. **Distinguishing Profanity from Bullying:** The multi-class system isolates generic complaints and vulgarity (`not_cyberbullying`) from targeted hostility against protected characteristics (`religion`, `ethnicity`, `gender`, `age`).
4. **Cultural & Vernacular Nuance Notice:** The system displays contextual uncertainty and explicit notifications regarding sarcasm, colloquial slang, and in-group reclaimed vernacular.

---

## 📚 Academic Course Outcome (CO) Verification

| Course Outcome | Description | Demonstrated in ShieldText |
|---|---|---|
| **CO1** | Linguistic foundations, tokenization & preprocessing | Modular regex cleaners, emoji translation, WordNet lemmatizer, negation-preserving stopword filter. |
| **CO2** | Distributed word embeddings | Word2Vec CBOW vs. Skip-Gram, cosine semantic search, vector analogies, PCA/t-SNE 2D maps. |
| **CO3** | Recurrent sequence models | PyTorch Unidirectional LSTM and Bidirectional LSTM with Word2Vec weights and masked max-pooling. |
| **CO4** | Sequence attention mechanisms | Additive self-attention layer over BiLSTM hidden states with token heatmap visualizer. |
| **CO5** | Pretrained transformers & fine-tuning | DistilBERT subword tokenization and sequence classification fine-tuned with AdamW. |
| **CO6** | Evaluation, explainability & Responsible AI | Macro/weighted F1, confusion matrices, occlusion sensitivity, and non-retention privacy policy. |

---

## 📄 Academic Documentation Directory (`docs/`)
- **[Full Project Report](docs/PROJECT_REPORT.md):** 19-section academic paper including abstract, literature review, mathematical formulations, empirical results, and references.
- **[Defense Presentation Slides](docs/PRESENTATION.md):** 12 structured slides designed for academic project review and seminar presentations.
- **[Viva Voce Preparation Guide](docs/VIVA_QUESTIONS.md):** 35 in-depth viva questions covering NLP foundations, equations, and architectural design choices.
- **[Project Completion Report](PROJECT_COMPLETION_REPORT.md):** Detailed audit of deliverables, features, and actual performance metrics.

---

## 👥 Authors & Academic Attribution
- **Course:** CSE472 — Deep Learning for Natural Language Processing
- **Academic Session:** 2026–27
- **Dataset Attribution:** Wang, J., et al. (2021). *Automated Cyberbullying Detection on Social Media: A Deep Learning Approach.*

