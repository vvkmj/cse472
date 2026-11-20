# ShieldText: Comprehensive Academic Viva Voce Preparation Guide

**Course:** CSE472 — Deep Learning for Natural Language Processing  
**Session:** 2026–27  
**System:** ShieldText Cyberbullying Detection and Classification System  

---

## Section 1: NLP Foundations & Preprocessing (CO1)

### Q1: What are the fundamental steps in an NLP text preprocessing pipeline, and why was each chosen for ShieldText?
**Answer:**  
The ShieldText pipeline executes:
1. **HTML & Entity Cleaning:** Removes markup artifacts (`&amp;`, `<br>`) to reduce noise.
2. **URL & Mention Normalization:** Replaces `@user` and `https://` with space or tokens (`[USER]`, `[URL]`). This prevents the model from associating specific user handles or web domains with cyberbullying labels.
3. **Emoji Translation:** Translates high-frequency emotive emojis into textual descriptors (e.g., 😡 $\rightarrow$ `angry_face`). Emojis contain vital affective sentiment that would be lost if stripped as non-ASCII characters.
4. **Case Normalization:** Converts text to lowercase for classical and recurrent models to reduce vocabulary sparsity. (Preserved for BERT/Transformers).
5. **Tokenization:** Breaks running strings into distinct lexical tokens using `nltk.word_tokenize`.
6. **Negation-Preserving Stopword Filtering:** Removes high-frequency syntactic glue words while explicitly keeping negation terms (`not`, `no`, `never`, `nor`, `cannot`).
7. **Lemmatization:** Reduces words to dictionary lemmas via WordNet.

---

### Q2: Why is aggressive stopword removal dangerous in cyberbullying detection?
**Answer:**  
Standard stopword lists (such as the default NLTK or Scikit-learn English lists) include negation words like `not`, `no`, `never`, `neither`, and `against`. In cyberbullying detection, removing these words inverts the semantic meaning of the sentence. For example:
- Original: *"He is not a violent bully."*
- After standard stopword removal: `["violent", "bully"]`
The classifier receives only abusive keywords, converting a benign or defensive statement into a severe false positive. ShieldText uses a customized stopword filter that preserves all negation operators.

---

### Q3: What is the theoretical and practical difference between stemming and lemmatization?
**Answer:**  
- **Stemming (e.g., Porter Stemmer):** Applies heuristic rule-based truncation of common suffixes (e.g., *-ing*, *-ed*, *-s*). It is fast but operates without morphological awareness, frequently generating non-words (e.g., *"university"* $\rightarrow$ *"univers"*, *"crying"* $\rightarrow$ *"cri"*).
- **Lemmatization (e.g., WordNet Lemmatizer):** Uses a lexical database and morphological analysis to map inflected forms back to legitimate dictionary base forms (lemmas) (e.g., *"better"* $\rightarrow$ *"good"*, *"crying"* $\rightarrow$ *"cry"*).
- **Choice:** Lemmatization was selected for our vocabulary and Word2Vec models because valid dictionary forms preserve semantic vector alignments much better than truncated non-words.

---

### Q4: How are Out-of-Vocabulary (OOV) tokens handled across your different model families?
**Answer:**  
- **In PyTorch Neural Models (LSTM / BiLSTM / Attention):** The vocabulary reserves special index `0` for `<PAD>` and index `1` for `<UNK>`. Any word not observed during vocabulary construction or having frequency $< 2$ is mapped to `<UNK>`.
- **In Word2Vec Average Embedding:** Out-of-vocabulary words are omitted when computing the document vector average. If a document contains zero known words, a zero-vector $\vec{0} \in \mathbb{R}^{100}$ is returned.
- **In DistilBERT (Transformers):** DistilBERT uses **WordPiece subword tokenization**. Unseen complex or slang words are decomposed into subword chunks (e.g., *"cyberbully"* $\rightarrow$ `["cyber", "##bul", "##ly"]`). The token is only mapped to `[UNK]` if a constituent character is completely absent from the 30,522-token vocabulary.

---

## Section 2: Feature Representation & Distributed Vectors (CO2)

### Q5: Explain the mathematical formulation of TF-IDF. Why is sublinear TF useful?
**Answer:**  
Term Frequency-Inverse Document Frequency evaluates the relative importance of token $t$ in document $d$ within corpus $D$:
$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \text{IDF}(t, D)$$
where Inverse Document Frequency is defined as:
$$\text{IDF}(t, D) = \log\left(\frac{1 + |D|}{1 + \text{DF}(t, D)}\right) + 1$$
**Sublinear TF:** In standard TF, a word appearing 20 times in a tweet is weighted 20 times higher than a word appearing once. However, repetition in social media often represents emotional spam rather than 20x information. Using sublinear TF replaces $\text{TF}$ with $1 + \log(\text{TF})$ for $\text{TF} > 0$, dampening the effect of repetitive keywords.

---

### Q6: Contrast the Word2Vec CBOW and Skip-Gram architectures. Which performed better and why?
**Answer:**  
- **Continuous Bag-of-Words (CBOW):** Takes the average of context word embeddings $\frac{1}{2c}\sum_{-c \le j \le c, j \neq 0} v_{w_{t+j}}$ and predicts the target center word $w_t$. It trains faster and averages across context windows, making it effective for frequent words and syntax.
- **Skip-Gram (SGNS):** Takes the center target word $w_t$ and attempts to predict each surrounding context word $w_{t+j}$. Rare words and offensive slang receive individual gradient updates rather than being diluted by context averaging.
- **Empirical Results in ShieldText:**
  - CBOW trained in **1.4s** on our 45,749 tweets, achieving **78.49%** test accuracy.
  - Skip-Gram trained in **4.6s**, achieving **78.54%** test accuracy.
  - Skip-Gram marginally outperformed CBOW on rare slang terms, while CBOW was 3.3x faster to train.

---

### Q7: How does vector arithmetic enable word analogy verification in Word2Vec?
**Answer:**  
Because Word2Vec objective functions enforce that words appearing in similar contexts share similar directional displacements in vector space, linear relationships between concepts correspond to vector offsets:
$$\vec{v}(\text{king}) - \vec{v}(\text{man}) \approx \vec{v}(\text{queen}) - \vec{v}(\text{woman})$$
In ShieldText, we tested domain analogies such as:
$$\vec{v}(\text{attack}) - \vec{v}(\text{hate}) + \vec{v}(\text{love}) \approx \vec{v}(\text{friend})$$
Cosine similarity is computed across the vocabulary against the target offset vector to identify the nearest neighbor tokens.

---

### Q8: What is the difference between PCA and t-SNE for embedding visualization?
**Answer:**  
- **PCA (Principal Component Analysis):** A linear dimensionality reduction technique that finds orthogonal axes (eigenvectors of the covariance matrix) maximizing global variance. It is computationally deterministic and fast, but cannot capture complex non-linear manifolds.
- **t-SNE (t-Distributed Stochastic Neighbor Embedding):** A non-linear probabilistic technique that converts Euclidean distances between high-dimensional data points into conditional probabilities and minimizes the Kullback-Leibler (KL) divergence with a Student-t distribution in 2D space.
- **Role in ShieldText:** PCA provides a global view of variance, while t-SNE reveals localized clusters of thematic terms (e.g., schoolyard terms clustering distinctly from religious slurs).

---

## Section 3: Recurrent Sequence Classifiers & Pooling (CO3)

### Q9: Why are Recurrent Neural Networks (RNNs) structurally suited for text over Bag-of-Words?
**Answer:**  
Bag-of-Words (BoW) treats a sentence as an unordered set of tokens, discarding word order and grammatical structure. In contrast, RNNs process text sequentially, maintaining an internal hidden state vector $h_t = f(W x_t + U h_{t-1} + b)$ that updates with each incoming token. This allows the model to preserve temporal order, clause structure, and syntactic relationships.

---

### Q10: How do Long Short-Term Memory (LSTM) networks resolve the vanishing gradient problem?
**Answer:**  
Standard RNNs repeatedly multiply gradients by the recurrent weight matrix $W$ during backpropagation through time (BPTT). Over long sequences, if the largest eigenvalue of $W < 1$, gradients vanish exponentially to zero.
LSTMs introduce a dedicated linear cell state $c_t$ governed by three non-linear gates:
1. **Forget Gate ($f_t$):** $\sigma(W_f x_t + U_f h_{t-1} + b_f)$ — controls what proportion of the old cell state to discard.
2. **Input Gate ($i_t$):** $\sigma(W_i x_t + U_i h_{t-1} + b_i)$ — controls what new candidate information $\tilde{c}_t = \tanh(W_c x_t + U_c h_{t-1} + b_c)$ to write to the cell.
3. **Output Gate ($o_t$):** $\sigma(W_o x_t + U_o h_{t-1} + b_o)$ — controls what proportion of the cell state $c_t$ to reveal as hidden state $h_t = o_t \odot \tanh(c_t)$.
Because the cell state update $c_t = f_t \odot c_{t-1} + i_t \odot \tilde{c}_t$ is additive rather than purely multiplicative, error gradients flow backwards through time with minimal decay.

---

### Q11: Explain Bidirectional LSTM (BiLSTM). Why did it achieve the top accuracy in ShieldText?
**Answer:**  
A unidirectional LSTM only reads text from left to right ($1 \rightarrow T$). Consequently, the representation of an early word cannot incorporate information from subsequent clarifying words.
A BiLSTM processes the input sequence concurrently using two independent recurrent layers:
1. Forward LSTM ($\vec{h}_t$) reading from $t=1$ to $T$.
2. Backward LSTM ($\overleftarrow{h}_t$) reading from $t=T$ down to $1$.
The concatenated representation $h_t = [\vec{h}_t \,;\, \overleftarrow{h}_t]$ incorporates both preceding and succeeding context. In social media text, offensive intent is often revealed at the end of the sentence (*"You think you are clever, you idiot"*); the BiLSTM allows earlier tokens to be contextualized by the final offensive insult, leading to our highest test accuracy (**84.96%**).

---

### Q12: What is the "pad token degradation" issue in PyTorch LSTM classification, and how did ShieldText fix it?
**Answer:**  
When batches contain variable-length texts padded to a uniform sequence length (e.g., $L = 80$) with `<PAD>` tokens (index 0) at the end:
- A standard naive implementation takes the final hidden state $h_L$.
- If a tweet has only 12 words followed by 68 `<PAD>` tokens, the LSTM spends 68 steps updating its hidden state on zeros, causing the true sentence representations to decay or wash out.
- **ShieldText Solution:** We implemented **masked max-pooling**:
  $$\text{mask} = (x \neq \text{PAD\_IDX})$$
  $$h_{\text{masked}} = h_{\text{all}}.\text{masked\_fill}(\sim \text{mask}, -10^9)$$
  $$h_{\text{pooled}} = \max_{t} h_{\text{masked}}$$
  This ignores all padded timesteps and takes the element-wise maximum over genuine word states, immediately boosting validation accuracy from ~17% to >84%.

---

## Section 4: Attention Mechanisms (CO4)

### Q13: Describe the mathematical formulation of the additive Self-Attention mechanism implemented in Model D.
**Answer:**  
Given the sequence of hidden states $H = (h_1, \dots, h_L) \in \mathbb{R}^{L \times 2H}$ produced by the BiLSTM:
1. Each hidden state is projected into an attention space of dimension $d_a = 64$:
   $$u_t = \tanh(W_a h_t + b_a) \in \mathbb{R}^{d_a}$$
2. An alignment score is calculated via dot product with a learnable query vector $v_a \in \mathbb{R}^{d_a}$:
   $$\text{score}_t = u_t^T v_a$$
3. Padded tokens are masked by setting $\text{score}_t = -10^9$ where $x_t = \text{PAD}$.
4. A softmax is applied across the sequence length to produce normalized attention weights:
   $$\alpha_t = \frac{\exp(\text{score}_t)}{\sum_{k \in \text{valid}} \exp(\text{score}_k)}, \quad \sum_{t=1}^L \alpha_t = 1$$
5. The final sentence representation is the weighted combination of hidden states:
   $$c = \sum_{t=1}^L \alpha_t h_t \in \mathbb{R}^{2H}$$

---

### Q14: Does attention automatically provide a "true explanation" of a model's decision?
**Answer:**  
**No.** As established by recent academic literature (e.g., Jain & Wallace, 2019, *"Attention is not Explanation"*; Wiegreffe & Pinter, 2019):
- Attention weights $\alpha_t$ represent intermediate weighting coefficients learned by the network during feature aggregation.
- While they highlight tokens that contributed heavily to the pooled vector, they do not prove human causal intent or explain feature interactions in subsequent dense layers.
- In ShieldText, attention weights are presented as **decision support visualizations**, accompanied by explicit disclaimers that statistical attention is not proof of subjective malice.

---

## Section 5: Transformer Encoders & BERT Fine-Tuning (CO5)

### Q15: How does BERT's attention mechanism differ from sequence-to-sequence Bahdanau attention?
**Answer:**  
- **Bahdanau Attention:** Typically acts as a bridge between an encoder and a decoder (cross-attention) in RNN translation models, aligning target output tokens with source input tokens.
- **BERT Multi-Head Self-Attention:** Computes pairwise dot-product attention between *all tokens* within the same sequence simultaneously:
  $$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V$$
  Every token attends to every other token across multiple projection subspaces (heads) in parallel, allowing deep bidirectional context to be learned across all layers without sequential recurrence.

---

### Q16: Why was DistilBERT chosen, and how does knowledge distillation work?
**Answer:**  
- **Motivation:** `bert-base-uncased` has 110M parameters and requires substantial GPU memory and compute time. For academic student deployment on laptop hardware, `distilbert-base-uncased` provides an ideal trade-off.
- **Distillation Mechanism:** DistilBERT is trained using a student-teacher framework (Sanh et al., 2019). The 6-layer student network learns to mimic the output distribution (soft targets) and hidden representations of the 12-layer BERT teacher network:
  $$\mathcal{L} = \alpha \mathcal{L}_{\text{ce}} + \beta \mathcal{L}_{\text{mlm}} + \gamma \mathcal{L}_{\text{cos}}$$
- **Result:** Retains **97%** of BERT's language comprehension capability, reduces parameters by **40%**, and executes inference **60% faster**.

---

### Q17: What is the purpose of AdamW and linear learning rate warmup in transformer fine-tuning?
**Answer:**  
- **AdamW (Decoupled Weight Decay):** Standard Adam applies L2 regularization to gradients, which interacts poorly with adaptive momentum updates. Loshchilov & Hutter (2017) demonstrated that decoupling weight decay directly from the gradient update prevents parameter explosion and regularizes transformers effectively.
- **Linear Warmup:** At the beginning of fine-tuning, the pretrained transformer layers are already near an optimal general language manifold, but the newly initialized classification head has random weights and produces large gradients. Gradually increasing the learning rate from $0$ to $\eta_{\max}$ over the first 10% of steps prevents initial erratic updates from destroying pretrained weights ("catastrophic forgetting").

---

## Section 6: Evaluation Metrics & Class Imbalance (CO6)

### Q18: Why is Macro F1 preferred over Accuracy in multi-class text classification?
**Answer:**  
Accuracy simply measures the percentage of correct predictions over the entire dataset:
$$\text{Accuracy} = \frac{\sum_{i=1}^K \text{TP}_i}{N}$$
If a dataset has severe class imbalance (e.g., 90% non-bullying, 10% bullying), a naive classifier predicting "non-bullying" for every sample achieves 90% accuracy but has 0% utility.
**Macro F1** calculates the unweighted mean of F1-scores across all individual classes:
$$\text{Macro F1} = \frac{1}{K} \sum_{i=1}^K F1_i$$
It treats every class with equal importance, ensuring that poor performance on a minority or nuanced category cannot be masked by high performance on dominant classes.

---

### Q19: What does the Confusion Matrix reveal about the "other_cyberbullying" class?
**Answer:**  
The confusion matrix shows that `other_cyberbullying` exhibits the lowest individual F1-score (~56%) across all models, and has the highest confusion with `not_cyberbullying`.
**Linguistic Reason:**
- The categories *Religion*, *Age*, *Ethnicity*, and *Gender* have clear, identifiable lexical anchors (slurs, identity terms, schoolyard vocabulary).
- *Other Cyberbullying* consists of varied personal insults, situational hostility, and subjective harassment lacking unified keywords. Consequently, models frequently confuse subtle personal attacks with non-cyberbullying heated disagreements.

---

### Q20: What is data leakage, and how was it prevented in ShieldText?
**Answer:**  
Data leakage occurs when information from outside the training dataset is inadvertently used to train the model, producing unrealistically optimistic test results that fail to generalize in production.
In ShieldText, data leakage was prevented by:
1. **Corpus Deduplication:** Identifying and removing 1,675 exact duplicate tweets before splitting, ensuring no identical text appears in both train and test splits.
2. **Strict Preprocessing Isolation:** Vocabulary mapping, TF-IDF vectorizer fitting, and class encoders were fit **strictly on the training split** (32,024 samples) and applied transformed to the validation and test splits.
3. **Independent Test Holdout:** The test split (6,863 samples) was completely sequestered and evaluated only after all hyperparameters, early stopping, and training epochs were locked.

---

## Section 7: Explainability & Interpretability

### Q21: How does token occlusion sensitivity work in your deep learning models?
**Answer:**  
Occlusion sensitivity (perturbation analysis) measures the causal influence of an individual token by evaluating the drop in predicted confidence when that token is masked or removed:
$$\text{Importance}(w_i) = P(y = \hat{c} \mid x) - P(y = \hat{c} \mid x \setminus \{w_i\})$$
If removing token $w_i$ causes the predicted cyberbullying class probability to drop significantly, $w_i$ had high positive attribution toward that decision. It is model-agnostic and functions effectively for both LSTM and Transformer architectures.

---

### Q22: How do TF-IDF class coefficients explain linear model predictions?
**Answer:**  
In linear models (Logistic Regression and Linear SVM), the classification logit for class $k$ is an inner product:
$$z_k = \sum_{j=1}^M w_{k, j} \cdot x_j + b_k$$
where $x_j$ is the TF-IDF weight of token $j$ and $w_{k, j}$ is the learned weight. By inspecting the product $w_{k, j} \cdot x_j$ for words present in the user's text, we can directly identify and rank which specific n-grams contributed the largest positive log-odds toward the predicted class.

---

## Section 8: Responsible AI, Bias & Ethics

### Q23: Why should automated moderation systems never execute fully automated user bans?
**Answer:**  
1. **False Positives:** Sarcasm, quoting abusive behavior for reportage, educational discussions, and reclaimed colloquialisms can trigger false alarms. An automated ban unfairly penalizes innocent users.
2. **Context Blindness:** Models evaluate text in isolation without access to interpersonal history or conversational tone.
3. **Due Process:** Ethical AI principles demand that punitive actions impacting user rights and community participation include human review and an appeal process. ShieldText is explicitly architected as a **decision-support tool**.

---

### Q24: What is demographic collection bias, and how might it manifest in social media datasets?
**Answer:**  
Datasets collected via keyword-based scraping (e.g., searching for known slurs or hashtag queries) suffer from **sampling bias**:
- Over-representation of explicit, vulgar harassment.
- Under-representation of subtle, passive-aggressive, or contextual bullying.
- **Dialect Bias:** Models trained on Twitter data can exhibit false-positive bias against African American Vernacular English (AAVE) if colloquial terms are misannotated as offensive in the training corpus (Sap et al., 2019).

---

### Q25: How does ShieldText respect user privacy during batch and live inference?
**Answer:**  
- **Non-Retention Policy:** Submitted texts and uploaded CSV files are processed in-memory (RAM) and are never written to permanent disk databases, cloud buckets, or secondary logging stores.
- **Ephemeral Processing:** Uploaded CSV batches are validated, analyzed, streamed back to the client, and immediately garbage-collected by the Python runtime.

---

## Section 9: Engineering & System Architecture

### Q26: Why choose FastAPI over Flask or Django for this NLP backend?
**Answer:**  
1. **Asynchronous Concurrency:** Built on ASGI (Starlette + Uvicorn), FastAPI natively supports `async/await` coroutines, allowing non-blocking I/O during heavy inference calls.
2. **Type Safety & Auto-Validation:** Pydantic schemas validate input payload structures, lengths, and types automatically at runtime with clear error reporting.
3. **Automatic OpenAPI/Swagger Documentation:** Interactive API documentation is generated automatically at `/docs`.
4. **Performance:** Benchmarks demonstrate FastAPI throughput is on par with Go and NodeJS, significantly exceeding traditional WSGI Flask servers.

---

### Q27: How does your frontend architecture communicate with the backend?
**Answer:**  
The React frontend connects via asynchronous HTTP REST calls using the browser's `fetch` API:
- In development: Vite proxies requests from `localhost:3000/api` to `localhost:8000/api`.
- In production: FastAPI mounts the compiled React distribution bundle from `frontend/dist/` at the root path `/` and serves static assets from `/assets`, allowing the entire system to run as a unified single-port application.

---

### Q28: How does the batch analysis endpoint prevent server crashes when large CSV files are uploaded?
**Answer:**  
1. **MIME/Extension Verification:** Enforces `.csv` validation prior to parsing.
2. **Chunked Memory Streams:** Reads file buffers using `io.StringIO` to prevent disk thrashing.
3. **Auto-Column Detection:** Searches for candidate column names (`text`, `tweet_text`, `comment`) with fallback to string dtypes.
4. **Row Batch Limiting:** Enforces a ceiling of 500 records per real-time batch session, preventing GPU out-of-memory errors or connection timeouts.

---

## Section 10: Comparative Justifications & Deep Learning Theory

### Q29: Why did the TF-IDF baseline perform almost as well as the deep neural models?
**Answer:**  
The Wang et al. cyberbullying dataset has prominent lexical markers for several categories (*religion*, *age*, *ethnicity*). When target classes are correlated with distinct vocabulary keywords, a high-capacity TF-IDF representation (unigrams + bigrams up to 15,000 features) combined with L2-regularized Logistic Regression provides a linear hyperplane that separates these clusters with high accuracy (84.00%). Neural models provide an advantage primarily on nuanced sequences, negation reversals, and word order variations.

---

### Q30: Why was a CNN (Convolutional Neural Network) not selected as the primary sequence model over BiLSTM?
**Answer:**  
While 1D CNNs (e.g., Kim, 2014) are effective at extracting local n-gram feature maps via fixed kernel windows (e.g., filter sizes 3, 4, 5), they struggle to capture long-distance syntactic dependencies without stacking many dilated layers. BiLSTMs maintain persistent memory over the entire sequence duration, which is critical for understanding conversational context spanning across multiple clauses.

---

### Q31: What is the purpose of Dropout in the neural classifiers?
**Answer:**  
Dropout (Srivastava et al., 2014) is a regularization technique that randomly zeroes out neuron activations with probability $p = 0.3$ during each training forward pass. This prevents co-adaptation of feature detectors, forcing the network to learn redundant and robust representations. During evaluation (`model.eval()`), dropout is deactivated, scaling activations by $(1 - p)$.

---

### Q32: Explain the role of Word2Vec weight transfer into the PyTorch embedding layer.
**Answer:**  
Rather than initializing the PyTorch `nn.Embedding(vocab_size, 100)` with random Gaussian noise, we extract the learned 100-dimensional weight vectors from the trained `word2vec_cbow.model`. This provides the neural network with warm-start semantic representations (synonyms and geometric alignments) learned from the full corpus before backpropagation begins, accelerating convergence and improving generalization on infrequent words.

---

### Q33: How does the system distinguish ordinary offensive language from cyberbullying?
**Answer:**  
The dataset and models explicitly feature a `not_cyberbullying` category that includes tweets with profanity, complaints, or negative sentiment that are *not* directed as targeted harassment against individuals or protected identity groups. In addition, the `other_cyberbullying` class captures general harassment, allowing the model to differentiate between coarse swearing and systemic demographic cyberbullying.

---

### Q34: What are the primary hyperparameter choices in your BiLSTM training?
**Answer:**  
- **Vocabulary Size:** 14,892 tokens (minimum frequency $= 2$).
- **Embedding Dimension:** 100 (matching Word2Vec).
- **Hidden Units:** 128 per direction ($256$ total concatenated).
- **Recurrent Layers:** 2 stacked layers with recurrent dropout ($0.3$).
- **Dense Head:** 256 $\rightarrow$ 64 (ReLU + Dropout 0.3) $\rightarrow$ 6 classes.
- **Optimizer:** Adam ($\text{lr} = 10^{-3}$, weight decay $= 10^{-5}$, gradient clip norm $= 5.0$).
- **Batch Size:** 64 with early stopping patience $= 3$ epochs.

---

### Q35: If given more computational resources, what single enhancement would you prioritize?
**Answer:**  
Fine-tuning a larger cross-encoder like `roberta-large` or `deberta-v3-large` with conversational thread context. Cyberbullying rarely occurs as an isolated single tweet; it typically unfolds as a multi-turn dialogue where initial remarks are followed by escalating harassment. Incorporating conversational context history using hierarchical attention or dense thread encoders would significantly improve detection of subtle and persistent harassment.

