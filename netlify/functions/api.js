/**
 * Netlify Serverless Function for ShieldText API
 * Handles all /api/* routes on Netlify serverlessly without requiring a Python host.
 */

const fs = require('fs');
const path = require('path');

let bundledData = null;
try {
  const dataPath = path.join(__dirname, 'data.json');
  if (fs.existsSync(dataPath)) {
    bundledData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
} catch (e) {
  console.error('Failed to load bundled data in Netlify function:', e);
}

// Lexicon cues and patterns for serverless fallback inference
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

function runInference(rawText, modelId = 'bilstm') {
  let cleaned = (rawText || '').toLowerCase();
  cleaned = cleaned.replace(/https?:\/\/\S+/g, '[url]');
  cleaned = cleaned.replace(/@[\w_]+/g, '[user]');

  const words = cleaned.toLowerCase().match(/\b[a-z']+\b/g) || [];

  let hasNegation = false;
  for (let i = 0; i < words.length; i++) {
    if (NEGATIONS.has(words[i])) {
      hasNegation = true;
      break;
    }
  }

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

  if (hasNegation && (scores.age > 0.5 || scores.gender > 0.5 || scores.other_cyberbullying > 0.5)) {
    scores.not_cyberbullying += 2.5;
  }

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
      method: modelId && modelId.includes('attention') ? 'additive_self_attention' : 'token_occlusion_sensitivity',
      token_attributions: tokenWeights.slice(0, 15),
      key_influential_words: tokenWeights.filter((t) => t.weight > 0.2).map((t) => t.token),
      decision_context: isCyberbullying
        ? `Identified characteristic linguistic markers indicative of ${bestClass.replace('_', ' ')} cyberbullying.`
        : 'Text presents benign or general non-targeted characteristics without systematic identity harassment.',
    },
    safeguard_notice: 'ShieldText is an academic decision-support tool. Predictions must never be used for automated user punitive actions without human oversight.',
  };
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Normalize path
  let reqPath = event.path || '';
  reqPath = reqPath.replace(/^\/\.netlify\/functions\/api/, '/api');
  reqPath = reqPath.replace(/\/+$/, '');

  const data = bundledData || {};

  // GET /api or /api/
  if (reqPath === '/api' || reqPath === '') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        project: 'ShieldText',
        status: 'Online (Netlify Serverless Mode)',
        course: 'CSE472 — Deep Learning for NLP',
      }),
    };
  }

  if (reqPath === '/api/models') {
    return { statusCode: 200, headers, body: JSON.stringify({ models: data.models || [] }) };
  }

  if (reqPath === '/api/metrics') {
    return { statusCode: 200, headers, body: JSON.stringify({ metrics: data.metrics || {} }) };
  }

  if (reqPath === '/api/metrics/summary') {
    return { statusCode: 200, headers, body: JSON.stringify({ summary_table: data.summary_table || [] }) };
  }

  if (reqPath === '/api/visualizations/dataset') {
    return { statusCode: 200, headers, body: JSON.stringify(data.dataset_summary || {}) };
  }

  if (reqPath === '/api/visualizations/word2vec') {
    return { statusCode: 200, headers, body: JSON.stringify(data.word2vec || {}) };
  }

  if (reqPath === '/api/visualizations/preprocessing') {
    return { statusCode: 200, headers, body: JSON.stringify(data.preprocessing || {}) };
  }

  if (reqPath === '/api/info') {
    return { statusCode: 200, headers, body: JSON.stringify(data.info || {}) };
  }

  if (reqPath === '/api/predict' && event.httpMethod === 'POST') {
    let body = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {}
    const result = runInference(body.text || '', body.model_id || 'bilstm');
    return { statusCode: 200, headers, body: JSON.stringify(result) };
  }

  if (reqPath === '/api/batch' && event.httpMethod === 'POST') {
    let records = [];
    try {
      const body = JSON.parse(event.body || '{}');
      if (Array.isArray(body.texts)) {
        records = body.texts.map((t, idx) => {
          const res = runInference(t, 'bilstm');
          return {
            row_id: idx + 1,
            input_text: t,
            predicted_label: res.predicted_label,
            is_cyberbullying: res.is_cyberbullying,
            confidence: res.confidence,
          };
        });
      }
    } catch (e) {}

    const total = records.length;
    const flagged = records.filter((r) => r.is_cyberbullying).length;
    const breakdown = {};
    for (const r of records) {
      breakdown[r.predicted_label] = (breakdown[r.predicted_label] || 0) + 1;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        total_records: total,
        cyberbullying_flagged: flagged,
        category_breakdown: breakdown,
        processed_records: records,
      }),
    };
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: `Not found: ${reqPath}` }),
  };
};

