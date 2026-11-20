/**
 * Universal API Client for ShieldText
 *
 * Automatically connects to:
 * 1. Live FastAPI Python backend (via VITE_API_BASE_URL or local proxy)
 * 2. Netlify Serverless Functions (/api/...)
 * 3. Client-Side High-Performance NLP Engine (runInferenceEngine) powered by
 *    the real trained 15,005-feature statistical ML weights.
 */

import { bundledApiData } from '../data/bundledApiData';
import { runInferenceEngine } from './inferenceEngine';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '';

    // If response is valid JSON, return it directly from the live server/function
    if (response.ok && contentType.includes('application/json')) {
      const json = await response.json();
      // Ensure prediction result is valid before returning
      if (endpoint === '/api/predict' && json && json.predicted_label) {
        return json;
      } else if (endpoint !== '/api/predict') {
        return json;
      }
    }

    console.warn(`[ShieldText API] Endpoint ${endpoint} returned status ${response.status} (${contentType}). Using built-in statistical NLP engine.`);
  } catch (err) {
    console.warn(`[ShieldText API] Network request to ${url} failed: ${err.message}. Using built-in statistical NLP engine.`);
  }

  // =========================================================================
  // BUILT-IN STATISTICAL ML ENGINE FALLBACK HANDLERS
  // =========================================================================

  if (endpoint === '/api/models' || endpoint === '/models') {
    return { models: bundledApiData.models };
  }

  if (endpoint === '/api/metrics' || endpoint === '/metrics') {
    return { metrics: bundledApiData.metrics };
  }

  if (endpoint === '/api/metrics/summary' || endpoint === '/metrics/summary') {
    return { summary_table: bundledApiData.summary_table };
  }

  if (endpoint === '/api/visualizations/dataset') {
    return bundledApiData.dataset_summary;
  }

  if (endpoint === '/api/visualizations/word2vec') {
    return bundledApiData.word2vec;
  }

  if (endpoint === '/api/visualizations/preprocessing') {
    return bundledApiData.preprocessing;
  }

  if (endpoint === '/api/info') {
    return bundledApiData.info;
  }

  if (endpoint === '/api/predict' && options.method === 'POST') {
    let body = {};
    try {
      body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
    } catch (e) {}

    return runInferenceEngine(body.text || '', body.model_id || 'logistic_regression');
  }

  if (endpoint === '/api/batch' && options.method === 'POST') {
    let records = [];
    if (options.body instanceof FormData) {
      const file = options.body.get('file');
      if (file) {
        const textContent = await file.text();
        const lines = textContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
        const header = lines[0].toLowerCase();
        const isHeader = header.includes('text') || header.includes('tweet') || header.includes('comment');
        const dataLines = isHeader ? lines.slice(1, 101) : lines.slice(0, 100);

        records = dataLines.map((line, idx) => {
          const text = line.replace(/^["']|["']$/g, '').trim();
          const pred = runInferenceEngine(text, 'logistic_regression');
          return {
            row_id: idx + 1,
            text: text.length > 120 ? text.slice(0, 120) + '...' : text,
            full_text: text,
            predicted_label: pred.predicted_label,
            is_cyberbullying: pred.is_cyberbullying,
            confidence: pred.confidence,
          };
        });
      }
    } else {
      let body = {};
      try {
        body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
      } catch (e) {}
      if (Array.isArray(body.texts)) {
        records = body.texts.map((t, idx) => {
          const pred = runInferenceEngine(t, body.model_id || 'logistic_regression');
          return {
            row_id: idx + 1,
            text: t.length > 120 ? t.slice(0, 120) + '...' : t,
            full_text: t,
            predicted_label: pred.predicted_label,
            is_cyberbullying: pred.is_cyberbullying,
            confidence: pred.confidence,
          };
        });
      }
    }

    const total = records.length;
    const flagged = records.filter((r) => r.is_cyberbullying).length;
    const breakdown = {};
    for (const r of records) {
      breakdown[r.predicted_label] = (breakdown[r.predicted_label] || 0) + 1;
    }
    const harmfulRatio = total > 0 ? Number(((flagged / total) * 100).toFixed(1)) : 0.0;

    return {
      status: 'success',
      total_records_processed: total,
      total_flagged_harmful: flagged,
      harmful_percentage: harmfulRatio,
      category_distribution: breakdown,
      records: records,
    };
  }

  return {};
}
