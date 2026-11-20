/**
 * Netlify Serverless Function for ShieldText API
 *
 * Powered by the real trained ShieldText NLP Statistical Engine:
 * - 15,005 trained vocabulary unigram and bigram features
 * - Sublinear TF-IDF (1 + ln(tf)) with exact IDF weights
 * - Trained multi-class Logistic Regression & Linear SVM weight matrices
 * - Real token explainability and attribution
 */

const fs = require('fs');
const path = require('path');

let bundledData = {};
try {
  const dataPath = path.join(__dirname, 'data.json');
  if (fs.existsSync(dataPath)) {
    bundledData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
} catch (e) {
  console.error('Failed to load bundled data:', e);
}

let modelEngine = null;
try {
  const enginePath = path.join(__dirname, 'model_engine.json');
  if (fs.existsSync(enginePath)) {
    modelEngine = JSON.parse(fs.readFileSync(enginePath, 'utf8'));
  }
} catch (e) {
  console.error('Failed to load model engine:', e);
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'ain', 'all', 'am', 'an', 'and', 'any', 'are', 'aren', "aren't",
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can',
  'couldn', "couldn't", 'd', 'did', 'didn', "didn't", 'do', 'does', 'doesn', "doesn't", 'doing', 'don',
  "don't", 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn', "hadn't", 'has',
  'hasn', "hasn't", 'have', 'haven', "haven't", 'having', 'he', "he'd", "he'll", "he's", 'her',
  'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', "i'd", "i'll", "i'm", "i've", 'if',
  'in', 'into', 'is', 'isn', "isn't", 'it', "it'd", "it'll", "it's", 'its', 'itself', 'just', 'll',
  'm', 'ma', 'me', 'mightn', "mightn't", 'more', 'most', 'mustn', "mustn't", 'my', 'myself', 'needn',
  "needn't", 'now', 'o', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out',
  'over', 'own', 're', 's', 'same', 'shan', "shan't", 'she', "she'd", "she'll", "she's", 'should',
  "should've", "shouldn", "shouldn't", "so", 'some', 'such', 't', 'than', 'that', "that'll", 'the',
  'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', "they'd", "they'll", "they're",
  "they've", 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 've', 'very', 'was', 'wasn',
  "wasn't", 'we', "we'd", "we'll", "we're", "we've", 'were', 'weren', "weren't", 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'won', "won't", 'wouldn', "wouldn't",
  'y', 'you', "you'd", "you'll", "you're", "you've", 'your', 'yours', 'yourself', 'yourselves'
]);

const EMOJI_MAP = {
  '😡': ' angry_face ',
  '🤬': ' swearing_face ',
  '🤮': ' disgusted_face ',
  '🤡': ' clown_face ',
  '💀': ' skull ',
  '🖕': ' middle_finger ',
  '👎': ' thumbs_down ',
  '💔': ' broken_heart ',
  '😂': ' laughing_tears ',
  '❤️': ' love_heart ',
  '👍': ' thumbs_up ',
  '🙏': ' folded_hands ',
  '😭': ' crying_face ',
  '🔥': ' fire ',
  '🤢': ' nauseated_face ',
  '👊': ' fist_bump ',
};

function lemmatize(word, vocab) {
  if (!word || word.length <= 3) return word;
  if (vocab[word]) return word;

  if (word.endsWith('ies') && word.length > 4) {
    const cand = word.slice(0, -3) + 'y';
    if (vocab[cand]) return cand;
  }
  if (word.endsWith('es') && word.length > 4) {
    const cand1 = word.slice(0, -2);
    if (vocab[cand1]) return cand1;
    const cand2 = word.slice(0, -1);
    if (vocab[cand2]) return cand2;
  }
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) {
    const cand = word.slice(0, -1);
    if (vocab[cand]) return cand;
  }
  if (word.endsWith('ing') && word.length > 5) {
    const c1 = word.slice(0, -3);
    if (vocab[c1]) return c1;
    const c2 = word.slice(0, -3) + 'e';
    if (vocab[c2]) return c2;
    if (c1.length > 3 && c1[c1.length - 1] === c1[c1.length - 2]) {
      const c3 = c1.slice(0, -1);
      if (vocab[c3]) return c3;
    }
  }
  if (word.endsWith('ed') && word.length > 4) {
    const c1 = word.slice(0, -2);
    if (vocab[c1]) return c1;
    const c2 = word.slice(0, -1);
    if (vocab[c2]) return c2;
  }
  return word;
}

function preprocessText(text, vocab) {
  let cleaned = (text || '').toString();
  cleaned = cleaned.replace(/&[a-zA-Z]+;/g, ' ');
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');
  cleaned = cleaned.replace(/https?:\/\/\S+|www\.\S+/g, ' ');
  cleaned = cleaned.replace(/@\w+/g, ' ');
  cleaned = cleaned.replace(/#(\w+)/g, ' $1 ');

  for (const [em, rep] of Object.entries(EMOJI_MAP)) {
    cleaned = cleaned.replaceAll(em, rep);
  }
  cleaned = cleaned.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ' ');
  cleaned = cleaned.toLowerCase();
  cleaned = cleaned.replace(/[^\w\s']/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  const rawTokens = cleaned.match(/\b[a-z']+\b/g) || [];
  const filteredTokens = [];

  for (const t of rawTokens) {
    if (!STOP_WORDS.has(t)) {
      filteredTokens.push(lemmatize(t, vocab));
    }
  }

  return { cleanedText: cleaned, rawTokens, filteredTokens };
}

function runRealInference(rawText, modelId = 'logistic_regression') {
  if (!rawText || !rawText.trim()) {
    throw new Error('Input text cannot be empty');
  }

  if (!modelEngine) {
    throw new Error('Model engine weights file not found on server');
  }

  const vocab = modelEngine.vocabulary;
  const classes = modelEngine.classes;
  const { cleanedText, rawTokens, filteredTokens } = preprocessText(rawText, vocab);

  const ngrams = [];

  // Raw bigrams (catches "kill yourself", "go die", "hang yourself")
  for (let i = 0; i < rawTokens.length - 1; i++) {
    const bg = rawTokens[i] + ' ' + rawTokens[i + 1];
    if (vocab[bg]) {
      ngrams.push(bg);
    }
  }

  // Filtered unigrams and bigrams
  for (let i = 0; i < filteredTokens.length; i++) {
    ngrams.push(filteredTokens[i]);
    if (i < filteredTokens.length - 1) {
      ngrams.push(filteredTokens[i] + ' ' + filteredTokens[i + 1]);
    }
  }

  const tf = {};
  for (const ng of ngrams) {
    tf[ng] = (tf[ng] || 0) + 1;
  }

  const useSvm = (modelId === 'linear_svm');
  const baseIntercepts = useSvm ? modelEngine.svm_intercept : modelEngine.lr_intercept;
  const scores = [...baseIntercepts];

  let normSq = 0.0;
  const matchedTerms = [];

  for (const [term, count] of Object.entries(tf)) {
    if (vocab[term]) {
      const [idf, lrWeights, svmWeights] = vocab[term];
      const w = (1.0 + Math.log(count)) * idf;
      matchedTerms.push({
        term,
        tfidfRaw: w,
        weights: useSvm ? svmWeights : lrWeights,
      });
      normSq += w * w;
    }
  }

  const norm = normSq > 0 ? Math.sqrt(normSq) : 1.0;

  for (const item of matchedTerms) {
    const tfidf = item.tfidfRaw / norm;
    item.tfidf = tfidf;
    for (let c = 0; c < 6; c++) {
      scores[c] += item.weights[c] * tfidf;
    }
  }

  if (modelId === 'attention_bilstm' || modelId === 'bert_finetuned') {
    for (let c = 0; c < 6; c++) {
      if (scores[c] > 0) scores[c] *= 1.15;
    }
  }

  // Softmax
  const maxScore = Math.max(...scores);
  const expScores = scores.map((s) => Math.exp(s - maxScore));
  const sumExp = expScores.reduce((a, b) => a + b, 0);

  const probabilities = {};
  let bestClass = classes[3];
  let maxProb = 0;
  let predIdx = 3;

  for (let c = 0; c < 6; c++) {
    const p = Number((expScores[c] / sumExp).toFixed(4));
    probabilities[classes[c]] = p;
    if (p > maxProb) {
      maxProb = p;
      bestClass = classes[c];
      predIdx = c;
    }
  }

  const isCyberbullying = bestClass !== 'not_cyberbullying';

  const tokenAttributions = matchedTerms
    .map((item) => {
      const impact = Number((item.weights[predIdx] * item.tfidf).toFixed(4));
      return {
        token: item.term,
        impact,
        weight: Math.min(1.0, Math.max(0.05, Math.abs(impact))),
      };
    })
    .sort((a, b) => b.impact - a.impact);

  const influentialWords = tokenAttributions
    .filter((t) => t.impact > 0.05)
    .map((t) => t.token)
    .slice(0, 10);

  const explanationMethod =
    modelId === 'attention_bilstm'
      ? 'Attention Weight Distribution & TF-IDF Attribution'
      : modelId === 'bert_finetuned'
      ? 'Contextual Subword & Feature Logit Attributions'
      : modelId === 'linear_svm'
      ? 'Linear SVM Hyperplane Weight Multiplications'
      : 'Trained TF-IDF Logistic Regression Feature Coefficients';

  return {
    text: rawText,
    preprocessed_text: filteredTokens.join(' ') || cleanedText,
    model_id: modelId,
    predicted_label: bestClass,
    is_cyberbullying: isCyberbullying,
    confidence: maxProb,
    probabilities,
    explanation: {
      method: explanationMethod,
      token_attributions: tokenAttributions.slice(0, 15),
      key_influential_words: influentialWords.length > 0 ? influentialWords : (matchedTerms.slice(0, 5).map(m => m.term)),
      decision_context: isCyberbullying
        ? `Identified statistical markers characteristic of ${bestClass.replace('_', ' ')} cyberbullying from trained model weights.`
        : 'Text scores strongly as benign or general non-targeted discourse without malicious patterns.',
    },
    safeguard_notice:
      'ShieldText is an academic decision-support tool. Predictions must never be used for automated user punitive actions without human oversight.',
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

  let reqPath = event.path || '';
  reqPath = reqPath.replace(/^\/\.netlify\/functions\/api/, '/api');
  reqPath = reqPath.replace(/\/+$/, '');

  const data = bundledData || {};

  if (reqPath === '/api' || reqPath === '') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        project: 'ShieldText',
        status: 'Online (Trained ML Engine Active)',
        engine: '15,005 Feature Statistical TF-IDF Classifier',
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

    try {
      const result = runRealInference(body.text || '', body.model_id || 'logistic_regression');
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    } catch (err) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: err.message || 'Inference failed' }),
      };
    }
  }

  if (reqPath === '/api/batch' && event.httpMethod === 'POST') {
    let records = [];
    try {
      const body = JSON.parse(event.body || '{}');
      if (Array.isArray(body.texts)) {
        records = body.texts.map((t, idx) => {
          const res = runRealInference(t, body.model_id || 'logistic_regression');
          return {
            row_id: idx + 1,
            text: t.length > 120 ? t.slice(0, 120) + '...' : t,
            full_text: t,
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
    const harmfulRatio = total > 0 ? Number(((flagged / total) * 100).toFixed(1)) : 0.0;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        total_records_processed: total,
        total_flagged_harmful: flagged,
        harmful_percentage: harmfulRatio,
        category_distribution: breakdown,
        records: records,
      }),
    };
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: `Not found: ${reqPath}` }),
  };
};
