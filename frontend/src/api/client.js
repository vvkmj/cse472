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
import { runInferenceEngine, extractTextsFromCsv } from './inferenceEngine';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function isValidApiResponse(endpoint, json) {
  if (!json || typeof json !== 'object') return false;
  if (endpoint === '/api/models' || endpoint === '/models') {
    return Array.isArray(json.models) && json.models.length > 0;
  }
  if (endpoint === '/api/metrics' || endpoint === '/metrics') {
    return Boolean(json.metrics && Object.keys(json.metrics).length > 0);
  }
  if (endpoint === '/api/metrics/summary' || endpoint === '/metrics/summary') {
    return Array.isArray(json.summary_table) && json.summary_table.length > 0;
  }
  if (endpoint === '/api/visualizations/dataset') {
    return Boolean(json.train_class_distribution);
  }
  if (endpoint === '/api/visualizations/word2vec') {
    return Boolean(json.visualizations && json.comparison);
  }
  if (endpoint === '/api/visualizations/preprocessing') {
    return Boolean(json.demonstration && json.tradeoffs);
  }
  if (endpoint === '/api/info') {
    return Boolean(json.course_mapping && json.responsible_ai_safeguards);
  }
  if (endpoint === '/api/predict') {
    return Boolean(json.predicted_label && json.probabilities);
  }
  if (endpoint === '/api/batch') {
    return Array.isArray(json.records) && json.records.length > 0;
  }
  return true;
}

export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '';

    if (response.ok && contentType.includes('application/json')) {
      const json = await response.json();
      if (isValidApiResponse(endpoint, json)) {
        return json;
      }
    }

    console.warn(
      `[ShieldText API] Endpoint ${endpoint} returned status ${response.status} (${contentType}) or empty payload. Using built-in statistical NLP engine.`
    );
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

  if (endpoint === '/api/predict' && method === 'POST') {
    let body = {};
    try {
      body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
    } catch (e) {}

    return runInferenceEngine(body.text || '', body.model_id || 'logistic_regression');
  }

  if (endpoint === '/api/batch' && method === 'POST') {
    let texts = [];
    let modelId = 'logistic_regression';
    let filename = 'batch_input.json';
    let textColumnUsed = 'text';

    if (options.body instanceof FormData) {
      const file = options.body.get('file');
      modelId = options.body.get('model_id') || 'bilstm';
      const reqColumn = options.body.get('text_column') || '';
      if (file) {
        filename = file.name || 'uploaded.csv';
        const textContent = await file.text();
        const extracted = extractTextsFromCsv(textContent, reqColumn);
        texts = extracted.texts;
        textColumnUsed = extracted.textColumnUsed;
      }
    } else {
      let body = {};
      try {
        body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
      } catch (e) {}
      if (Array.isArray(body.texts)) {
        texts = body.texts.slice(0, 500).map((t) => (t || '').toString().trim()).filter(Boolean);
      }
      modelId = body.model_id || 'logistic_regression';
    }

    const records = texts.map((text, idx) => {
      const clipped = text.slice(0, 2000);
      const pred = runInferenceEngine(clipped, modelId);
      return {
        row_id: idx + 1,
        text: text.length > 120 ? text.slice(0, 120) + '...' : text,
        full_text: text,
        predicted_label: pred.predicted_label,
        is_cyberbullying: pred.is_cyberbullying,
        confidence: pred.confidence,
      };
    });

    const total = records.length;
    const flagged = records.filter((r) => r.is_cyberbullying).length;
    const breakdown = {};
    for (const r of records) {
      breakdown[r.predicted_label] = (breakdown[r.predicted_label] || 0) + 1;
    }
    const harmfulRatio = total > 0 ? Number(((flagged / total) * 100).toFixed(1)) : 0.0;

    return {
      status: 'success',
      filename,
      text_column_used: textColumnUsed,
      total_records_processed: total,
      total_flagged_harmful: flagged,
      harmful_percentage: harmfulRatio,
      category_distribution: breakdown,
      records,
    };
  }

  return {};
}
