#!/usr/bin/env bash
# ==============================================================================
# ShieldText Execution Script
# CSE472: Deep Learning for NLP (2026-27)
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Ensure venv exists
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment in .venv..."
    python3 -m venv .venv
    .venv/bin/pip install --upgrade pip
    .venv/bin/pip install -r requirements.txt
fi

COMMAND="${1:-server}"

case "$COMMAND" in
    server)
        echo "=========================================================="
        echo " Starting ShieldText Unified Server on http://127.0.0.1:8000"
        echo "=========================================================="
        echo " - Interactive Web App: http://127.0.0.1:8000"
        echo " - Swagger API Docs:   http://127.0.0.1:8000/docs"
        echo "=========================================================="
        PYTHONPATH=. .venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
        ;;

    test)
        echo "Running ShieldText test suite via pytest..."
        PYTHONPATH=. .venv/bin/pytest tests/test_api_and_models.py -v
        ;;

    data)
        echo "Downloading and preparing dataset..."
        PYTHONPATH=. .venv/bin/python backend/utils/download_data.py
        PYTHONPATH=. .venv/bin/python backend/preprocessing/dataset_prep.py
        ;;

    train-baseline)
        echo "Training TF-IDF Baseline (Logistic Regression & Linear SVM)..."
        PYTHONPATH=. .venv/bin/python backend/training/train_baseline.py
        ;;

    train-w2v)
        echo "Training Word2Vec CBOW & Skip-Gram embeddings..."
        PYTHONPATH=. .venv/bin/python backend/training/train_word2vec.py
        ;;

    train-neural)
        echo "Training PyTorch LSTM, BiLSTM, and Attention-BiLSTM..."
        PYTHONPATH=. .venv/bin/python backend/training/train_neural.py --epochs 4
        ;;

    train-bert)
        echo "Fine-tuning DistilBERT transformer (quick mode)..."
        PYTHONPATH=. .venv/bin/python backend/training/train_bert.py --quick
        ;;

    build-frontend)
        echo "Building React production distribution bundle..."
        cd frontend
        npm run build
        cd ..
        echo "Frontend successfully built to frontend/dist/"
        ;;

    help|*)
        echo "Usage: ./run_project.sh [command]"
        echo ""
        echo "Available commands:"
        echo "  server          Start unified FastAPI + React web application (default)"
        echo "  test            Run automated PyTest test suite (13 tests)"
        echo "  data            Download and preprocess Wang et al. (2021) dataset"
        echo "  train-baseline  Train TF-IDF + Logistic Regression & Linear SVM"
        echo "  train-w2v       Train Word2Vec CBOW & Skip-Gram models + PCA/t-SNE"
        echo "  train-neural    Train PyTorch LSTM, BiLSTM, and Attention-BiLSTM"
        echo "  train-bert      Fine-tune DistilBERT sequence classification head"
        echo "  build-frontend  Compile React frontend into production bundle"
        ;;
esac

