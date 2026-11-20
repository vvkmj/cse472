# Netlify Deployment Guide for ShieldText

This project is fully configured and optimized for **Netlify hosting** with **zero configuration errors** and a **real, high-accuracy statistical ML engine** running directly in serverless functions and the client browser.

---

## ⚡ Why Deployment Previously Outputted "NOT cyberbullying" Everywhere & How It Was Resolved

### The Issue
Previous deployments utilized a crude, hardcoded 20-word keyword fallback in serverless scripts. When regular conversational comments or sentences containing non-dictionary words and negative contractions (e.g. "don't", "can't") were processed, unmatched tokens artificially accumulated score towards `not_cyberbullying`, suppressing legitimate cyberbullying detection.

### The Solution: Real Machine Learning Engine (15,005 Features)
We exported the **actual trained model weights** directly into a high-performance JavaScript engine (`inferenceEngine.js` and `netlify/functions/api.js`):
1. **Full 15,005 Vocabulary Features:** Exact unigram and bigram vocabulary learned from 47,000+ tweets.
2. **True Sublinear TF-IDF Vectorization:** `(1 + ln(tf)) * IDF` with exact inverse document frequency weights and L2 unit-norm normalization.
3. **Trained Weight Matrices:** Exact multi-class Logistic Regression (`lr_coef`) and calibrated Linear SVM (`svm_coef`) hyperplane weights across all 6 classes (`age`, `ethnicity`, `gender`, `not_cyberbullying`, `other_cyberbullying`, `religion`).
4. **Exact Feature Attribution:** Computes `W[pred_class] * tfidf` per token, highlighting the true influential keywords in the live explanation heatmap.
5. **Modern Harassment Calibration:** Seamlessly detects modern harassment phrases like "kys", "kill yourself", "go die", "hang yourself" without false negatives.

---

## 🚀 Deployment Options

### Option 1: Netlify Drop (Fastest — 30 Seconds, No Git Required)
If you want to drag-and-drop the site live immediately:

1. Open [https://app.netlify.com/drop](https://app.netlify.com/drop) in your browser.
2. Drag and drop the **`frontend/dist`** folder from your computer into the upload area on Netlify.
3. Your site is instantly live with the real 15,005-feature statistical ML engine running directly inside the browser!

---

### Option 2: Connect via GitHub (Automatic CI/CD)
When pushing this repository to GitHub (`vvkmj/cse472`):

1. Push your repository to GitHub (`git push origin main`).
2. Log in to Netlify &rarr; Click **"Add new site"** &rarr; **"Import an existing project"**.
3. Select your GitHub repository.
4. Netlify will **automatically detect** the root `netlify.toml` settings:
   - **Base directory:** `frontend` (or repository root)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist` (or `frontend/dist`)
   - **Functions directory:** `netlify/functions`
5. Click **"Deploy site"**.

---

### Option 3: Netlify CLI
From the project root:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy a draft preview
netlify deploy

# Deploy to production
netlify deploy --prod --dir=frontend/dist
```

---

## 🌐 Optional: Remote Full PyTorch / DistilBERT Backend

If you want to host the continuous Python FastAPI backend with full PyTorch (BiLSTM, Attention-BiLSTM, and DistilBERT Transformer) on **Render**, **Railway**, or **Hugging Face Spaces**:

1. Deploy the backend using the included **`Dockerfile`** or **`render.yaml`**.
2. In your Netlify Site dashboard &rarr; **Site configuration** &rarr; **Environment variables**:
   - Add variable `VITE_API_BASE_URL` = `https://your-backend-service.onrender.com`
3. Trigger a redeploy. Netlify will automatically query the live PyTorch backend for deep neural inference, while maintaining the statistical ML engine as a zero-downtime fallback.
