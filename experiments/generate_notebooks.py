"""Generates educational Jupyter Notebooks for experiments/ directory."""

import json
import os

EXPERIMENTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "experiments")
os.makedirs(EXPERIMENTS_DIR, exist_ok=True)


def make_notebook(cells):
    return {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3 (ipykernel)",
                "language": "python",
                "name": "python3",
            },
            "language_info": {
                "name": "python",
                "version": "3.13.2",
            },
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }


def md_cell(text):
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": [line + "\n" for line in text.strip().split("\n")],
    }


def code_cell(code):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [line + "\n" for line in code.strip().split("\n")],
    }


# Notebook 1: Preprocessing
nb1 = make_notebook([
    md_cell("# ShieldText — Experiment 1: NLP Preprocessing Pipeline\n**Course:** CSE472 Deep Learning for NLP\n**Objective:** Explore raw tweet text, deduplication, URL/mention normalization, negation-preserving stopword filtering, and lemmatization vs stemming."),
    code_cell("""import pandas as pd
import numpy as np
from backend.preprocessing.pipeline import TextPreprocessor

# Load raw dataset sample
df = pd.read_csv('../data/raw/cyberbullying_tweets.csv')
print('Raw Shape:', df.shape)
print('Class Distribution:\n', df['cyberbullying_type'].value_counts())
"""),
    code_cell("""preprocessor = TextPreprocessor()
demo = preprocessor.get_before_after_demonstration()
print('Original:', demo['original_text'])
print('\\nCleaned (Preserving Negations):', demo['classical_pipeline_output'])
print('\\nTransformer Ready:', demo['transformer_pipeline_output'])
"""),
    code_cell("""tradeoffs = preprocessor.explain_preprocessing_tradeoffs()
for k, v in tradeoffs.items():
    print(f'=== {k} ===\\n{v}\\n')
""")
])

# Notebook 2: Word Embeddings
nb2 = make_notebook([
    md_cell("# ShieldText — Experiment 2: Word2Vec Distributed Representations\n**Course:** CSE472 Deep Learning for NLP\n**Objective:** Train Word2Vec CBOW vs Skip-Gram, inspect cosine semantic similarity, test vector analogies, and compute 2D PCA & t-SNE projections."),
    code_cell("""import json
from gensim.models import Word2Vec
import numpy as np
import matplotlib.pyplot as plt

# Load trained models
cbow = Word2Vec.load('../saved_models/word2vec_cbow.model')
sg = Word2Vec.load('../saved_models/word2vec_skipgram.model')

print(f'CBOW Vocab: {len(cbow.wv)}, Vector Size: {cbow.vector_size}')
print(f'Skip-Gram Vocab: {len(sg.wv)}, Vector Size: {sg.vector_size}')
"""),
    code_cell("""# Test semantic nearest neighbors
words = ['bully', 'school', 'hate', 'threat']
for w in words:
    print(f'=== Top 5 Similar words to \"{w}\" (CBOW) ===')
    for sim_w, score in cbow.wv.most_similar(w, topn=5):
        print(f'  {sim_w}: {score:.4f}')
"""),
    code_cell("""# Vector Analogy: attack - hate + love
analogy = cbow.wv.most_similar(positive=['love', 'attack'], negative=['hate'], topn=3)
print('Analogy: hate is to attack as love is to ...')
for w, s in analogy:
    print(f'  {w}: {s:.4f}')
"""),
    code_cell("""# Load and plot 2D t-SNE embeddings
with open('../saved_models/word2vec_visualizations.json', 'r') as f:
    vis = json.load(f)['cbow_coords']

x = [item['tsne_x'] for item in vis[:30]]
y = [item['tsne_y'] for item in vis[:30]]
labels = [item['word'] for item in vis[:30]]

plt.figure(figsize=(10, 6))
plt.scatter(x, y, color='blue', alpha=0.7)
for i, txt in enumerate(labels):
    plt.annotate(txt, (x[i], y[i]), fontsize=9)
plt.title('Word2Vec CBOW 2D t-SNE Embeddings')
plt.grid(True, linestyle='--', alpha=0.5)
plt.show()
""")
])

# Notebook 3: Neural Sequence Models
nb3 = make_notebook([
    md_cell("# ShieldText — Experiment 3: Recurrent Architectures & Self-Attention\n**Course:** CSE472 Deep Learning for NLP\n**Objective:** Evaluate PyTorch Unidirectional LSTM, Bidirectional LSTM, and Attention-Based BiLSTM on sequence classification."),
    code_cell("""import json
import torch
import pandas as pd
from backend.models.neural_models import LSTMClassifier, BiLSTMClassifier, AttentionBiLSTMClassifier
from backend.preprocessing.vocab import Vocabulary

vocab = Vocabulary.load('../saved_models/vocab.json')
print(f'Vocabulary size: {len(vocab)}')

# Compare evaluation metrics
with open('../saved_models/lstm_metrics.json') as f:
    m_lstm = json.load(f)
with open('../saved_models/bilstm_metrics.json') as f:
    m_bilstm = json.load(f)
with open('../saved_models/attention_bilstm_metrics.json') as f:
    m_attn = json.load(f)

print(f\"LSTM Accuracy: {m_lstm['accuracy']:.4f}, Macro F1: {m_lstm['f1_macro']:.4f}\")
print(f\"BiLSTM Accuracy: {m_bilstm['accuracy']:.4f}, Macro F1: {m_bilstm['f1_macro']:.4f}\")
print(f\"Attention-BiLSTM Accuracy: {m_attn['accuracy']:.4f}, Macro F1: {m_attn['f1_macro']:.4f}\")
"""),
    code_cell("""# Inspect Attention Weights for a Sample Text
model = AttentionBiLSTMClassifier(vocab_size=len(vocab), embed_dim=100, hidden_dim=128, num_classes=6)
model.load_state_dict(torch.load('../saved_models/attention_bilstm_best.pt', map_location='cpu'))
model.eval()

sample = 'nobody likes you get out of our school'
tokens = sample.split()
indices = vocab.tokens_to_indices(tokens, max_len=80)
x_t = torch.tensor([indices], dtype=torch.long)

with torch.no_grad():
    logits, attn = model(x_t, return_attention=True)
    weights = attn[0][:len(tokens)].numpy()

for tok, w in zip(tokens, weights):
    print(f'{tok:15s} -> Attention Weight: {w:.4f}')
""")
])

# Notebook 4: Transformer Fine-Tuning
nb4 = make_notebook([
    md_cell("# ShieldText — Experiment 4: Transformer Encoders & DistilBERT\n**Course:** CSE472 Deep Learning for NLP\n**Objective:** Fine-tune pretrained DistilBERT for cyberbullying classification, evaluating subword tokenization and contextual representations."),
    code_cell("""import json
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

tokenizer = AutoTokenizer.from_pretrained('../saved_models/bert_finetuned')
model = AutoModelForSequenceClassification.from_pretrained('../saved_models/bert_finetuned')
model.eval()

with open('../saved_models/bert_metrics.json') as f:
    bert_metrics = json.load(f)

print(f\"Fine-Tuned BERT Test Accuracy: {bert_metrics['accuracy']:.4f}\")
print(f\"Fine-Tuned BERT Macro F1: {bert_metrics['f1_macro']:.4f}\")
"""),
    code_cell("""# Test Inference
text = 'Hey congratulations on winning the academic hackathon award!'
inputs = tokenizer(text, return_tensors='pt')
with torch.no_grad():
    logits = model(**inputs).logits
    probs = torch.softmax(logits, dim=1)[0].numpy()

labels = ['age', 'ethnicity', 'gender', 'not_cyberbullying', 'other_cyberbullying', 'religion']
pred_idx = probs.argmax()
print(f'Input: \"{text}\"')
print(f'Predicted: {labels[pred_idx]} ({probs[pred_idx]*100:.1f}% confidence)')
""")
])

for name, nb in [
    ("preprocessing.ipynb", nb1),
    ("word_embeddings.ipynb", nb2),
    ("lstm_training.ipynb", nb3),
    ("bert_finetuning.ipynb", nb4),
]:
    fpath = os.path.join(EXPERIMENTS_DIR, name)
    with open(fpath, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)
    print(f"Generated {fpath}")

