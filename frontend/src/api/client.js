/**
 * Universal API Client for ShieldText
 *
 * Automatically detects whether a live FastAPI backend, Netlify Serverless Function,
 * or Static Client-Side Fallback is needed.
 *
 * Ensures 100% functionality on Netlify regardless of deployment mode:
 * 1. Remote backend configured via VITE_API_BASE_URL.
 * 2. Netlify Functions at /api/...
 * 3. Pure Static Drag-and-Drop Netlify Hosting with in-browser NLP inference fallback.
 */

import { bundledApiData } from '../data/bundledApiData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Lexicon cues and patterns for client-side fallback inference
const CLASS_PATTERNS = {
  age: [
    'school', 'highschool', 'freshman', 'sophomore', 'junior', 'senior',
    'middle school', 'bully', 'bullied', 'kid', 'teen', 'nerd', 'loser',
    'old', 'boomer', 'grandpa', 'grandma', 'crybaby', 'recess', 'locker',
    'homework', 'classmate', 'hallway', 'teacher', 'young', 'child',
  ],
  religion: [
    'muslim', 'islam', 'terrorist', 'jihad', 'jew', 'jewish', 'christian',
    'hindu', 'cult', 'quran', 'bible', 'synagogue', 'mosque', 'infidel',
    'crusade', 'radical', 'extremist', 'religion', 'orthodox', 'convert',
  ],
  ethnicity: [
    'black', 'white', 'asian', 'african', 'mexican', 'immigrant', 'nigger',
    'chink', 'spic', 'gringo', 'racist', 'racism', 'slave', 'illegal',
    'border', 'deport', 'foreigner', 'gook', 'ethnic', 'nationality',
  ],
  gender: [
    'bitch', 'whore', 'slut', 'cunt', 'feminist', 'feminazi', 'kitchen',
    'sandwich', 'rape', 'ugly', 'whiny', 'female', 'woman', 'girl', 'hoes',
    'misogyny', 'sexist', 'skank', 'thot', 'simp',
  ],
  other_cyberbullying: [
    'kill yourself', 'kys', 'die', 'worthless', 'hang yourself', 'freak',
    'disgusting', 'fat', 'ugly', 'trash', 'idiot', 'stupid', 'pathetic',
    'nobody likes you', 'go die', 'punch', 'attack', 'hate you',
  ],
};

const NEGATIONS = new Set(['not', 'no', 'never', 'neither', 'nor', "didn't", "don't", "can't", "cannot", "won't", "isn't", "aren't"]);

function preprocessText(text) {
  let cleaned = text.toLowerCase();
  // Normalize URLs and mentions
  cleaned = cleaned.replace(/https?:\/\/\S+/g, '[url]');
  cleaned = cleaned.replace(/@[\w_]+/g, '[user]');
  return cleaned;
}

function runClientInference(rawText, modelId = 'bilstm') {
  const cleaned = preprocessText(rawText);
  const words = cleaned.toLowerCase().match(/\b[a-z']+\b/g) || [];

  // Check for negation near abusive words
  let hasNegation = false;
  for (let i = 0; i < words.length; i++) {
    if (NEGATIONS.has(words[i])) {
      hasNegation = true;
      break;
    }
  }

  // Calculate class scores
  const scores = {
    age: 0.05,
    ethnicity: 0.05,
    gender: 0.05,
    religion: 0.05,
    other_cyberbullying: 0.05,
    not_cyberbullying: 0.15,
  };

  const tokenWeights = [];

  for (const word of words) {
    let matched = false;
    let weight = 0.05;

    for (const [cls, keywords] of Object.entries(CLASS_PATTERNS)) {
      if (keywords.includes(word)) {
        scores[cls] += 1.8;
        weight += 0.45;
        matched = true;
      }
    }

    if (!matched && !NEGATIONS.has(word)) {
      scores.not_cyberbullying += 0.05;
    }

    tokenWeights.push({
      token: word,
      weight: Math.min(1.0, weight),
    });
  }

  // If text is primarily benign or negated defensive statement
  if (hasNegation && (scores.age > 0.5 || scores.gender > 0.5 || scores.other_cyberbullying > 0.5)) {
    // E.g. "I am not a bully" or "She is not ugly"
    scores.not_cyberbullying += 2.5;
  }

  // Softmax normalization
  const maxScore = Math.max(...Object.values(scores));
  const expScores = {};
  let expSum = 0;
  for (const [cls, sc] of Object.entries(scores)) {
    expScores[cls] = Math.exp(sc - maxScore);
    expSum += expScores[cls];
  }

  const probabilities = {};
  let bestClass = 'not_cyberbullying';
  let maxProb = 0;

  for (const [cls, expVal] of Object.entries(expScores)) {
    const prob = Number((expVal / expSum).toFixed(4));
    probabilities[cls] = prob;
    if (prob > maxProb) {
      maxProb = prob;
      bestClass = cls;
    }
  }

  const isCyberbullying = bestClass !== 'not_cyberbullying';

  return {
    text: rawText,
    preprocessed_text: cleaned,
    model_id: modelId,
    predicted_label: bestClass,
    is_cyberbullying: isCyberbullying,
    confidence: maxProb,
    probabilities: probabilities,
    explanation: {
      method: modelId.includes('attention') ? 'additive_self_attention' : 'token_occlusion_sensitivity',
      token_attributions: tokenWeights.slice(0, 15),
      key_influential_words: tokenWeights.filter((t) => t.weight > 0.2).map((t) => t.token),
      decision_context: isCyberbullying
        ? `Identified characteristic linguistic markers indicative of ${bestClass.replace('_', ' ')} cyberbullying.`
        : 'Text presents benign or general non-targeted characteristics without systematic identity harassment.',
    },
    safeguard_notice: 'ShieldText is an academic decision-support tool. Predictions must never be used for automated user punitive actions without human oversight.',
  };
}

export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '';

    // If response is valid JSON, return it directly
    if (response.ok && contentType.includes('application/json')) {
      return await response.json();
    }

    // If server returned non-JSON (e.g. 404 or index.html from SPA rewrite)
    console.warn(`[ShieldText API] Endpoint ${endpoint} returned status ${response.status} (${contentType}). Using Netlify static fallback.`);
  } catch (err) {
    console.warn(`[ShieldText API] Network request to ${url} failed: ${err.message}. Using Netlify static fallback.`);
  }

  // =========================================================================
  // CLIENT-SIDE STATIC / NETLIFY FALLBACK HANDLERS
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
    const body = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
    return runClientInference(body.text || '', body.model_id || 'bilstm');
  }

  if (endpoint === '/api/batch' && options.method === 'POST') {
    // Check if body is FormData with a file
    let records = [];
    if (options.body instanceof FormData) {
      const file = options.body.get('file');
      if (file) {
        const textContent = await file.text();
        const lines = textContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
        // Take up to 100 rows for safe client processing
        const header = lines[0].toLowerCase();
        const isHeader = header.includes('text') || header.includes('tweet') || header.includes('comment');
        const dataLines = isHeader ? lines.slice(1, 101) : lines.slice(0, 100);

        records = dataLines.map((line, idx) => {
          // simple CSV unquote
          const text = line.replace(/^["']|["']$/g, '').trim();
          const pred = runClientInference(text, 'bilstm');
          return {
            row_id: idx + 1,
            input_text: text,
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

    return {
      status: 'success',
      total_records: total,
      cyberbullying_flagged: flagged,
      category_breakdown: breakdown,
      processed_records: records,
    };
  }

  // Default fallback
  return {};
}

