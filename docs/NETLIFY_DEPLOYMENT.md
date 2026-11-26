# Netlify Deployment Guide for ShieldText

This project is configured for **Netlify hosting via GitHub CI/CD** with full serverless functions support (`/api/*`), static PDF/report delivery, and an offline/fallback client-side statistical ML engine.

---

## 🔧 Root Causes Fixed for GitHub → Netlify Hosting

1. **ESM vs. CommonJS Conflict in `frontend/netlify/functions`:**
   `frontend/package.json` uses `"type": "module"` for Vite, which previously forced Netlify's `esbuild` bundler and Node 20 runtime to treat `frontend/netlify/functions/api.js` (CommonJS) as an ES module. Added `frontend/netlify/functions/package.json` (`{"type": "commonjs"}`) so the function bundle compiles and runs cleanly in CommonJS.
2. **Missing `data.json` & `model_engine.json` Inside `esbuild` Bundles:**
   Previously `api.js` read `data.json` and `model_engine.json` dynamically via `fs.readFileSync(path.join(__dirname, ...))`, which `esbuild` omitted from the deployed Lambda bundle — causing empty `/api/models`, `/api/metrics/summary`, `/api/info`, a blank crash on `/api/visualizations/preprocessing`, and HTTP 400 `"Model engine weights file not found on server"` on `/api/predict`. Now `api.js` statically `require()`s both JSON files so `esbuild` bundles them directly, and `netlify.toml` also declares `included_files = ["netlify/functions/*.json"]`.
3. **Multipart CSV Upload Support on `/api/batch`:**
   Added native `multipart/form-data` + RFC 4180 CSV parsing (with `isBase64Encoded` handling and automatic column detection) to both `api.js` and `frontend/src/api/client.js`.
4. **Preprocessing, Negation Preservation & Token Attribution Alignment:**
   - Preserved negation terms (`not`, `no`, `nor`, `neither`, `never`, `none`, `cannot`, `against`) and matched Python's punctuation/emoji normalization (`don't` → `dont`, `😡` → `angryface`).
   - Returned `importance` alongside `impact` in `token_attributions` so `LiveDetection.jsx` renders exact signed feature contributions instead of `(+undefined)`.
5. **Redirects & Monorepo Build Detection:**
   - Added explicit `/api` and `/health` rules alongside `/api/*` and aligned `frontend/public/_redirects` status codes (`200`) with `netlify.toml`.
   - Added a `$CACHED_COMMIT_REF`-safe `ignore` rule in `netlify.toml` so Netlify triggers builds on edits to `frontend/`, `netlify.toml`, or `netlify/`.

---

## 🚀 Deployment Options

### Option 1: Connect via GitHub (Automatic CI/CD — Recommended)
When deploying `vvkmj/cse472` from GitHub:

1. Push your updated repository to GitHub (`git push origin main`).
2. Log in to Netlify → **Add new site** → **Import an existing project** → select `vvkmj/cse472`.
3. Leave Netlify UI build settings at their defaults (or ensure they match `netlify.toml`):
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`
4. Click **Deploy site** (or **Trigger deploy → Clear cache and deploy site** for an existing site).

---

### Option 2: Netlify Drop (Manual Static Upload)
1. Build locally: `cd frontend && npm run build`.
2. Open [https://app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop `frontend/dist`. The client-side statistical ML engine runs directly in the browser.

---

### Option 3: Netlify CLI
From the project root:

```bash
npm install -g netlify-cli
netlify dev      # Local Netlify dev server + serverless functions
netlify deploy --prod
```

---

## 🌐 Optional: Remote Full PyTorch / DistilBERT Backend

To connect live PyTorch (`BiLSTM`, `Attention-BiLSTM`) and `DistilBERT` inference from Render, Railway, or Hugging Face Spaces:

1. Deploy the backend using **`Dockerfile`** or **`render.yaml`**.
2. In Netlify **Site configuration → Environment variables**, set:
   - `VITE_API_BASE_URL` = `https://your-backend-service.onrender.com`
3. Trigger a redeploy.
