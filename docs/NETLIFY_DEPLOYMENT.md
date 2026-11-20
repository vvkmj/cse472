# Netlify Deployment Guide for ShieldText

This project is fully configured and optimized for **Netlify hosting** with **zero configuration errors**.

---

## 🚀 Deployment Options

### Option 1: Netlify Drop (Fastest — 30 Seconds, No Git Required)
If you just want to drag-and-drop the site live immediately:

1. Open [https://app.netlify.com/drop](https://app.netlify.com/drop) in your browser.
2. Drag and drop the **`frontend/dist`** folder from your computer into the upload area on Netlify.
3. Your site is instantly live!

> **Why this works:** The `frontend/dist` folder already contains:
> - `_redirects` (handles SPA routing so page refreshes never return 404).
> - `docs/` (contains both the 12-slide presentation and detailed technical report PDFs).
> - Standalone client-side NLP inference fallback & pre-bundled benchmark metrics (every tab, live text analyzer, and chart works 100% in the browser).

---

### Option 2: Connect via GitHub / GitLab / Bitbucket
If you are pushing this repository to GitHub:

1. Push your repository to GitHub.
2. Log in to Netlify &rarr; Click **"Add new site"** &rarr; **"Import an existing project"**.
3. Select your repository.
4. Netlify will **automatically detect** the root `netlify.toml` settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist` (or `dist`)
   - **Functions directory:** `netlify/functions`
5. Click **"Deploy site"**.

---

### Option 3: Netlify CLI
From the project root:

```bash
# Install Netlify CLI if you haven't already
npm install -g netlify-cli

# Deploy a draft preview
netlify deploy

# Deploy to production
netlify deploy --prod --dir=frontend/dist
```

---

## 🛠 What Was Modified for Netlify Compatibility

1. **`netlify.toml` Added at Root:**
   - Defines automated builds with Node 20.
   - Configures Netlify Functions (`netlify/functions`).
   - Adds SPA redirect rules (`/*` &rarr; `/index.html` `200`).
   - Directs PDF requests to static assets (`/api/info/*-pdf` &rarr; `/docs/*`).

2. **Root `package.json` Added:**
   - Provides top-level `npm run build` bridging to the frontend.

3. **`frontend/public/_redirects` Added:**
   - Ensures SPA routing fallback is bundled directly into `dist/`.

4. **Universal API Client (`frontend/src/api/client.js`):**
   - Seamlessly handles live FastAPI servers, Netlify Functions, and client-side offline execution.
   - All evaluation tables, Word2Vec projections, and live detection work regardless of whether a Python server is connected.

5. **Direct PDF Delivery:**
   - Copies both `ShieldText_Class_Presentation.pdf` and `ShieldText_Detailed_Report.pdf` into `frontend/public/docs/`, making them downloadable directly from the hosted site without backend dependencies.

6. **Optional Remote Backend (`VITE_API_BASE_URL`):**
   - If you ever host the Python FastAPI backend on Render, Railway, or Hugging Face Spaces, set `VITE_API_BASE_URL` in **Netlify Site settings > Environment variables** to point to your live backend.

