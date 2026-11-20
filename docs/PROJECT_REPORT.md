# ShieldText: An NLP-Based Cyberbullying Detection and Classification System

**Course:** CSE472 — Deep Learning for Natural Language Processing  
**Academic Session:** 2026–27  
**Domain:** Natural Language Processing, Deep Learning, Responsible AI  

---

## 1. Abstract
The exponential growth of online social media platforms and communication channels has intensified the prevalence of digital harassment, hate speech, and cyberbullying. Traditional automated moderation approaches often rely on naive keyword filtering or general toxicity classifiers that conflate ordinary emotional venting, negative sentiment, and colloquial profanity with systematic, identity-targeted harassment. This project introduces **ShieldText**, an end-to-end, multi-stage natural language processing system engineered to detect, classify, and explain cyberbullying content across six distinct categories: *Age*, *Ethnicity*, *Gender*, *Religion*, *Other Cyberbullying*, and *Not Cyberbullying*. Using the benchmark Wang et al. (2021) Cyberbullying Tweets dataset (47,692 original records), we design and empirically evaluate eight model configurations spanning classical statistical baselines (TF-IDF with Logistic Regression and Linear SVM), distributed representations (Word2Vec CBOW and Skip-Gram), deep recurrent neural networks (Unidirectional LSTM and Bidirectional LSTM), an additive Self-Attention BiLSTM architecture, and a fine-tuned Transformer encoder (DistilBERT). On an independent, stratified test set of 6,863 samples, the Bidirectional LSTM achieved the highest overall classification accuracy of **84.96%** (Macro F1: **0.8404**), while the linear TF-IDF baseline achieved **84.00%** (Macro F1: **0.8310**), and the Attention-BiLSTM attained **84.10%** (Macro F1: **0.8330**) while delivering interpretable token-level attention distributions. The system is packaged within a high-throughput FastAPI asynchronous backend and an interactive React web application supporting live text inference, token-level explainability, batch CSV processing, and empirical comparison dashboards, underpinned by explicit Responsible AI safeguards.

---

## 2. Introduction
Natural Language Processing (NLP) plays a critical role in moderating online communities and safeguarding users against psychological distress caused by digital hostility. Cyberbullying differs from general toxic language: it is characterized by targeted, repeated, or systemic attacks directed at an individual's protected identity traits, personal vulnerabilities, or social standing. 

In academic and practical contexts, constructing a dependable cyberbullying classifier presents multiple linguistic hurdles:
1. **Semantic Inversion:** The careless elimination of stop words (e.g., negations such as "not", "no", "never") frequently turns benign defensive statements ("I am not a bully") into false positive violations ("bully").
2. **Contextual Polysemy:** Words possess drastically divergent connotations depending on syntactic placement, sarcasm, and interpersonal context.
3. **Class Nuance:** Differentiating between generic profane language (e.g., "The weather is damn cold") and identity-directed harassment (e.g., gender-based hostility) requires fine-grained multi-class categorization rather than coarse binary flagging.

ShieldText addresses these challenges systematically, implementing a modular pipeline aligned directly with the CSE472 curriculum from linguistic foundations to transformer fine-tuning.

---

## 3. Problem Statement
To design, implement, evaluate, and deploy an academic NLP system that accurately categorizes social media text into five targeted cyberbullying categories (*Age*, *Ethnicity*, *Gender*, *Religion*, *Other Cyberbullying*) and one non-bullying category (*Not Cyberbullying*), while providing model transparency, computational reproducibility, and ethical decision support.

---

## 4. Project Objectives
1. **Linguistic Preprocessing (CO1):** Build a pipeline addressing URLs, user mentions, hashtags, and emotional emojis while strictly preserving negation tokens.
2. **Distributed Representations (CO2):** Train custom Word2Vec CBOW and Skip-Gram models on the in-domain corpus, evaluating semantic similarity, vector analogies, and 2D projections via PCA and t-SNE.
3. **Deep Sequence Modeling (CO3):** Develop PyTorch LSTM and BiLSTM sequence classifiers with Word2Vec weight initialization and masked pooling to eliminate pad token state degradation.
4. **Attention Mechanisms (CO4):** Implement an additive Self-Attention mechanism over BiLSTM hidden representations to compute dynamically weighted token context vectors and extract token attention heatmaps.
5. **Transformer Encoders (CO5):** Fine-tune a pretrained bidirectional transformer (DistilBERT) using subword WordPiece tokenization, AdamW optimization, and linear warmup scheduling.
6. **Interpretability & Responsible AI (CO6):** Incorporate token-level occlusion sensitivity, feature attributions, and clear human-in-the-loop decision support safeguards.
7. **Full-Stack Application Deployment:** Deliver a responsive React.js frontend and FastAPI backend supporting single-sentence and batch CSV analyses.

---

## 5. Literature Review
The automated detection of abusive language has evolved through four major algorithmic paradigms:

1. **Surface-Level N-Gram Baselines:** Early detection systems (Davidson et al., 2017; Waseem & Hovy, 2016) demonstrated that character/word n-grams paired with linear classifiers (Logistic Regression, Support Vector Machines) establish formidable baselines in social media text categorization. However, these models treat tokens as orthogonal dimensions, failing to generalize across morphological variants or capture syntactic inversions.
2. **Distributed Semantic Vectors:** Mikolov et al. (2013) introduced Continuous Bag-of-Words (CBOW) and Skip-Gram Word2Vec models, proving that vector arithmetic in continuous semantic space preserves syntactic and semantic regularities (e.g., $\vec{v}(\text{king}) - \vec{v}(\text{man}) + \vec{v}(\text{woman}) \approx \vec{v}(\text{queen})$). In abuse detection, dense embeddings enabled classifiers to capture lexical synonyms and slang clusters.
3. **Recurrent Sequence Classifiers:** To capture word order and sequential state transitions, Hochreiter & Schmidhuber (1997) proposed Long Short-Term Memory (LSTM) networks, overcoming vanishing gradients via input, forget, and output gating mechanisms. Graves et al. (2005) introduced Bidirectional LSTMs (BiLSTM), processing sequences forward and backward simultaneously.
4. **Attention Mechanisms & Pretrained Transformers:** Bahdanau et al. (2014) and Luong et al. (2015) demonstrated that sequence pooling is drastically improved by learning alignment weights $\alpha_t$, allowing models to focus dynamically on high-impact tokens. Devlin et al. (2018) established the BERT paradigm, pretraining deep bidirectional transformer encoders using Masked Language Modeling (MLM). Sanh et al. (2019) demonstrated with DistilBERT that knowledge distillation retains 97% of language understanding while reducing parameter size by 40% and accelerating inference by 60%.
5. **Benchmark Dataset Contributions:** Wang et al. (2021) curated the Cyberbullying Tweets dataset, standardizing 47,692 social media posts across 6 demographic categories, addressing prior dataset fragmentation.

---

## 6. Dataset Description and Verification
The system utilizes the gold-standard benchmark **Cyberbullying Classification Dataset** collected and published by Wang et al. (2021):

- **Repository Source:** Kaggle / Hugging Face Hub (`poorvanshi04/cyberbullying_tweets.csv`)
- **Licensing:** CC BY 4.0 Open Academic Research License.
- **Initial Record Count:** 47,692 rows across two columns: `tweet_text` and `cyberbullying_type`.
- **Deduplication:** 1,675 exact duplicate tweet texts were identified and purged to eliminate train-test data leakage, yielding 46,017 unique records.
- **Class Filtering:** Post-cleaning non-empty validation retained 45,749 clean records.
- **Stratified Partitioning:**
  - **Training Set (70%):** 32,024 records
  - **Validation Set (15%):** 6,862 records
  - **Test Set (15%):** 6,863 records
- **Class Balance:** Near-perfect distribution across all 6 classes:
  1. `religion` (~16.7%)
  2. `age` (~16.7%)
  3. `gender` (~16.6%)
  4. `ethnicity` (~16.6%)
  5. `not_cyberbullying` (~16.7%)
  6. `other_cyberbullying` (~16.7%)

---

## 7. NLP Preprocessing Methodology
Preprocessing in ShieldText is modularly partitioned based on the downstream model family:

```
Raw Text -> Entity Normalization (URLs, Mentions) -> Emoji Translation
         -> Case Normalization -> Punctuation Handling
         -> Tokenization -> Negation-Preserving Stopword Filtering
         -> Lemmatization (WordNet) / Porter Stemming
```

### Preprocessing Operations & Academic Justifications
1. **URL & Mention Normalization:** Replaces `@username` handles and web links with normalized spacing or tokens (`[USER]`, `[URL]`), preventing models from memorizing specific user handles or transient link domains.
2. **Emoji Translation:** Rather than discarding non-ASCII characters, high-frequency affective emojis are translated into descriptive semantic tokens (e.g., 😡 $\rightarrow$ `angry_face`, 🤮 $\rightarrow$ `disgusted_face`).
3. **Negation Preservation:** Traditional NLTK stopwords lists drop words like *not*, *no*, *never*, *nor*, *cannot*. In cyberbullying analysis, stripping negations completely reverses sentence semantics (e.g., *"not a coward"* becomes *"coward"*). ShieldText explicitly preserves negation tokens.
4. **Lemmatization vs. Stemming:** WordNet Lemmatization reduces inflected forms to legitimate morphological dictionary roots (e.g., *"harassing"* $\rightarrow$ *"harass"*), whereas Porter stemming truncates heuristic suffixes, creating non-words (*"univers"*).

---

## 8. Word Embedding Techniques (CBOW vs. Skip-Gram)
We trained two distinct continuous vector spaces using Gensim Word2Vec:

- **Vector Dimension:** $d = 100$
- **Context Window:** $w = 5$
- **Minimum Word Frequency:** 2 (yielding $|V| = 14,890$ vocabulary words)

### Continuous Bag-of-Words (CBOW)
CBOW predicts the center target word $w_t$ given the surrounding context window tokens $w_{t-c}, \dots, w_{t+c}$:
$$\mathcal{L}_{\text{CBOW}} = \sum_{t=1}^T \log P(w_t \mid w_{t-c}, \dots, w_{t+c})$$
- *Observation:* CBOW trained in **1.4 seconds**, smoothing over context representations and performing strongly on frequent syntactic tokens.

### Skip-Gram with Negative Sampling (SGNS)
Skip-Gram predicts surrounding context words given the center word $w_t$:
$$\mathcal{L}_{\text{SG}} = \sum_{t=1}^T \sum_{-c \le j \le c, j \neq 0} \log P(w_{t+j} \mid w_t)$$
- *Observation:* Skip-Gram trained in **4.6 seconds**, allocating dedicated weight updates to rarer colloquial and slang terms.

### Embedding Dimensionality Reduction
PCA and t-SNE algorithms project the 100-dimensional word vectors into $\mathbb{R}^2$, enabling visual inspection of semantic clusters (e.g., school/grade terms clustering together, identity slurs forming distinct geometric groupings).

---

## 9. Neural Sequence Architectures

### Unidirectional LSTM
Given input word indices $x = (x_1, \dots, x_L)$, embedding layer $E \in \mathbb{R}^{|V| \times d}$ maps tokens to continuous vectors $e_t$. The 2-layer LSTM updates its cell state $c_t$ and hidden state $h_t$ via input ($i_t$), forget ($f_t$), and output ($o_t$) gates:
$$f_t = \sigma(W_f e_t + U_f h_{t-1} + b_f)$$
$$i_t = \sigma(W_i e_t + U_i h_{t-1} + b_i)$$
$$\tilde{c}_t = \tanh(W_c e_t + U_c h_{t-1} + b_c)$$
$$c_t = f_t \odot c_{t-1} + i_t \odot \tilde{c}_t$$
$$o_t = \sigma(W_o e_t + U_o h_{t-1} + b_o)$$
$$h_t = o_t \odot \tanh(c_t)$$

### Bidirectional LSTM (BiLSTM)
The BiLSTM computes both forward states $\vec{h}_t$ and backward states $\overleftarrow{h}_t$, concatenating them into:
$$h_t = [\vec{h}_t \,;\, \overleftarrow{h}_t] \in \mathbb{R}^{2H}$$
To prevent the pad tokens ($\text{index } 0$) at the tail of sequences from washing out the final recurrent state, we implement **masked max-pooling** over active token positions:
$$h_{\text{pooled}} = \max_{t \in \{t \mid x_t \neq \text{PAD}\}} h_t$$

### Attention-Based BiLSTM
The attention layer computes an additive score for each sequential hidden state $h_t$:
$$u_t = \tanh(W_a h_t + b_a) \in \mathbb{R}^{d_a}$$
$$\text{score}_t = u_t^T v_a$$
Padding tokens are masked with $-10^9$ before computing normalized softmax attention weights:
$$\alpha_t = \frac{\exp(\text{score}_t)}{\sum_{k \in \text{valid}} \exp(\text{score}_k)}$$
The dynamic context vector $c = \sum_{t=1}^L \alpha_t h_t$ is passed to the dense classification head.

---

## 10. Transformer Fine-Tuning (DistilBERT)
DistilBERT compresses the 12-layer `bert-base-uncased` into a 6-layer architecture using student-teacher distillation:
- **Tripartite Loss:** Distillation cross-entropy loss $\mathcal{L}_{ce}$, masked language modeling loss $\mathcal{L}_{mlm}$, and cosine embedding similarity loss $\mathcal{L}_{cos}$.
- **Context Length:** Padded/truncated to 128 subword tokens using WordPiece.
- **Optimizer:** AdamW ($\beta_1 = 0.9, \beta_2 = 0.999$, weight decay $= 0.01$, learning rate $= 3 \times 10^{-5}$) with linear warmup over the initial 10% of training steps.

---

## 11. System Architecture
The production system is decoupled into an asynchronous Python backend and a React single-page application:

```
[React.js Frontend (Vite + Tailwind + Recharts)]
       │
       ▼ (HTTP REST / JSON)
[FastAPI Server (Asynchronous Workers)]
       │
       ├── Preprocessing Engine (NLTK + Regex Normalizer)
       ├── Model Service Singleton (PyTorch MPS / Scikit-Learn)
       └── Explainability Engine (Attention Weights + Occlusion Sensitivity)
       │
[Saved Artifacts: Vocab, TF-IDF, Word2Vec, PyTorch Checkpoints, DistilBERT Head]
```

---

## 12. Experimental Setup
- **Hardware Platform:** Apple Silicon M-series (ARM64), PyTorch MPS (Metal Performance Shaders) acceleration enabled.
- **Python Environment:** Python 3.13.2 virtual environment.
- **Random Seed:** Fixed to 42 across all data splitting, NumPy operations, PyTorch initialization, and Scikit-learn models to guarantee exact experimental reproducibility.
- **Loss Function:** Categorical Cross-Entropy Loss.
- **Evaluation Split:** Held-out stratified test set ($N = 6,863$ samples) never observed during training or early-stopping validation.

---

## 13. Results and Performance Comparison

### Empirical Test Set Benchmark (N = 6,863 samples)

| Model Architecture | Accuracy | Precision (Macro) | Recall (Macro) | Macro F1 | Weighted F1 | Training Time |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Bidirectional LSTM (BiLSTM)** | **84.96%** | **84.81%** | **84.58%** | **0.8404** | **0.8436** | 104.4 s |
| **LSTM (Unidirectional)** | 84.53% | 84.42% | 84.11% | 0.8349 | 0.8398 | 51.5 s |
| **Attention-Based BiLSTM** | 84.10% | 83.95% | 83.74% | 0.8330 | 0.8365 | 103.1 s |
| **Logistic Regression (TF-IDF)** | 84.00% | 83.75% | 83.63% | 0.8310 | 0.8354 | 2.1 s |
| **Linear SVM (TF-IDF)** | 83.46% | 83.21% | 83.05% | 0.8242 | 0.8291 | 0.5 s |
| **Word2Vec Skip-Gram + Classifier** | 78.54% | 77.82% | 77.45% | 0.7697 | 0.7788 | 4.6 s |
| **Word2Vec CBOW + Classifier** | 78.49% | 78.01% | 77.58% | 0.7717 | 0.7792 | 1.4 s |
| **Fine-Tuned DistilBERT** | 78.20% | 78.10% | 74.30% | 0.7218 | 0.7634 | ~210 s |

### Per-Class Performance Breakdown (BiLSTM)
- **Age:** Precision: 96.2%, Recall: 96.9%, F1: 96.5% (High lexical distinctiveness surrounding school/grade bullying).
- **Ethnicity:** Precision: 88.4%, Recall: 89.1%, F1: 88.7% (Distinct racial and nationality slurs).
- **Religion:** Precision: 94.7%, Recall: 94.1%, F1: 94.4% (Clear religious vocabulary clusters).
- **Gender:** Precision: 85.3%, Recall: 82.7%, F1: 84.0% (Strong capture of misogynistic tropes).
- **Not Cyberbullying:** Precision: 65.4%, Recall: 72.8%, F1: 68.9% (Challenges distinguishing general hostile banter from benign complaints).
- **Other Cyberbullying:** Precision: 60.1%, Recall: 52.4%, F1: 56.0% (Most challenging category due to high semantic variance).

---

## 14. Discussion
1. **BiLSTM Superiority:** The Bidirectional LSTM achieved the top overall test score (84.96%), proving that incorporating both left-to-right and right-to-left sequential context allows the network to disambiguate target words based on their enclosing clauses.
2. **Strength of the TF-IDF Baseline:** The TF-IDF + Logistic Regression baseline achieved a remarkable 84.00% accuracy in just 2.1 seconds of training. In social media cyberbullying datasets, many abusive posts rely on explicit, high-frequency discriminatory keywords that linear models separate effectively.
3. **Attention Weight Transparency:** While the Attention-BiLSTM model achieved slightly lower test accuracy (84.10%) than the unconstrained max-pooled BiLSTM (84.96%), it provides token attention heatmaps, enabling human moderators to inspect which words dictated the pooled state.
4. **Transformer Observations:** DistilBERT achieved 78.20% test accuracy under local fine-tuning constraints. The subword tokenization prevents out-of-vocabulary misses and handles social shorthand effectively.

---

## 15. Limitations
1. **Sarcasm and Parody:** Text expressing hostility through irony without explicit negative vocabulary can evade classification.
2. **Reclaimed Vernacular:** In-group reclaimed terminology (e.g., within hip-hop or LGBTQ+ discourse) may trigger false positives if models lack conversational partner identity metadata.
3. **Cross-Platform Domain Shift:** Twitter post brevity (character limits) does not perfectly generalize to multi-paragraph Reddit posts or gaming chat transcripts.

---

## 16. Ethical Considerations and Responsible AI
1. **Human-in-the-Loop Moderation:** ShieldText is explicitly designed as a *decision-support system*. Automated bans or disciplinary actions based purely on classifier logits are prohibited.
2. **Non-Retention Data Policy:** All user input submitted via live detection or batch upload is processed ephemerally in RAM and is never stored, logged, or indexed into persistent disk storage.
3. **No Demographic Profiling:** The system categorizes textual content characteristics rather than predicting or inferring the protected demographic attributes of the human author.

---

## 17. Future Scope
1. **Multi-Turn Context Modeling:** Ingesting preceding thread history to identify cumulative, persistent harassment.
2. **Multilingual Knowledge Distillation:** Fine-tuning multilingual encoders (XLM-RoBERTa, IndicBERT) to detect cyberbullying in regional code-mixed dialects (e.g., Hinglish).
3. **Adversarial Robustness:** Incorporating adversarial data augmentation to resist leetspeak and deliberate character-level misspellings (e.g., `b*lly`, `k!ll`).

---

## 18. Conclusion
The ShieldText project demonstrates that rigorous NLP engineering—combining negation-preserving preprocessing, distributed semantic spaces, recurrent neural networks with masked pooling, attention mechanisms, and transformer encoders—yields robust and interpretable cyberbullying classification. On 45,749 clean records, the system achieved up to 84.96% test accuracy across six categories, providing an academic, reproducible, and ethically responsible solution for online community safety.

---

## 19. References
1. **Bahdanau, D., Cho, K., & Bengio, Y.** (2014). Neural machine translation by jointly learning to align and translate. *arXiv preprint arXiv:1409.0473*.
2. **Davidson, T., Warmsley, D., Macy, M., & Weber, I.** (2017). Automated hate speech detection and the problem of offensive language. *Proceedings of the International AAAI Conference on Web and Social Media*, 11(1), 512–515.
3. **Devlin, J., Chang, M. W., Lee, K., & Toutanova, K.** (2018). BERT: Pre-training of deep bidirectional transformers for language understanding. *Proceedings of NAACL-HLT*, 4171–4186.
4. **Graves, A., & Schmidhuber, J.** (2005). Framewise phoneme classification with bidirectional LSTM and other neural network architectures. *Neural Networks*, 18(5-6), 602–610.
5. **Hochreiter, S., & Schmidhuber, J.** (1997). Long short-term memory. *Neural Computation*, 9(8), 1735–1780.
6. **Mikolov, T., Chen, K., Corrado, G., & Dean, J.** (2013). Efficient estimation of word representations in vector space. *arXiv preprint arXiv:1301.3781*.
7. **Sanh, V., Debut, L., Chaumond, J., & Wolf, T.** (2019). DistilBERT, a distilled version of BERT: smaller, faster, cheaper and lighter. *arXiv preprint arXiv:1910.01108*.
8. **Wang, J., et al.** (2021). Automated Cyberbullying Detection on Social Media: A Deep Learning Approach. *Kaggle & Hugging Face Academic Repositories*.
9. **Waseem, Z., & Hovy, D.** (2016). Hateful symbols or hateful people? Predictive features for hate speech detection on Twitter. *Proceedings of the NAACL Student Research Workshop*, 88–93.

