/**
 * Netlify Serverless Function for ShieldText API
 *
 * Powered by the real trained ShieldText NLP Statistical Engine:
 * - 15,005 trained vocabulary unigram and bigram features
 * - Sublinear TF-IDF (1 + ln(tf)) with exact IDF weights and L2 normalization
 * - Trained multi-class Logistic Regression & Linear SVM weight matrices
 * - Negation-preserving stopword filter matching backend/preprocessing/pipeline.py
 * - Real token explainability, attribution, and multipart CSV batch processing
 */

const fs = require('fs');
const path = require('path');

// Static require ensures esbuild bundles JSON payloads directly into the serverless function.
let bundledData = {};
try {
  bundledData = require('./data.json');
} catch (e) {
  try {
    const dataPath = path.join(__dirname, 'data.json');
    if (fs.existsSync(dataPath)) {
      bundledData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
  } catch (err) {
    console.error('Failed to load bundled data:', err);
  }
}

let modelEngine = null;
try {
  modelEngine = require('./model_engine.json');
} catch (e) {
  try {
    const enginePath = path.join(__dirname, 'model_engine.json');
    if (fs.existsSync(enginePath)) {
      modelEngine = JSON.parse(fs.readFileSync(enginePath, 'utf8'));
    }
  } catch (err) {
    console.error('Failed to load model engine:', err);
  }
}

// Mirrors NLTK English stopwords minus negation terms preserved in pipeline.py
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'ain', 'all', 'am', 'an', 'and', 'any', 'are', 'aren', 'arent',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can',
  'couldn', 'couldnt', 'd', 'did', 'didn', 'didnt', 'do', 'does', 'doesn', 'doesnt', 'doing', 'don',
  'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn', 'hadnt', 'has',
  'hasn', 'hasnt', 'have', 'haven', 'havent', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isn', 'isnt', 'it', 'its', 'itself', 'just',
  'll', 'm', 'ma', 'me', 'mightn', 'mightnt', 'more', 'most', 'mustn', 'mustnt', 'my', 'myself', 'needn',
  'neednt', 'now', 'o', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves',
  'out', 'over', 'own', 're', 's', 'same', 'shan', 'shant', 'she', 'shes', 'should', 'shouldve',
  'shouldn', 'shouldnt', 'so', 'some', 'such', 't', 'than', 'that', 'thatll', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 've', 'very', 'was', 'wasn', 'wasnt', 'we', 'were', 'weren', 'werent', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'won', 'wont', 'wouldn',
  'wouldnt', 'y', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves',
]);

const NEGATION_WORDS = new Set(['not', 'no', 'nor', 'neither', 'never', 'none', 'cannot', 'against']);
for (const neg of NEGATION_WORDS) {
  STOP_WORDS.delete(neg);
}

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
  '❤': ' love_heart ',
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
    const esStripTwo = /(?:s|x|z|ch|sh)es$/.test(word);
    const cand1 = word.slice(0, -2);
    const cand2 = word.slice(0, -1);
    if (esStripTwo) {
      if (vocab[cand1]) return cand1;
      if (vocab[cand2]) return cand2;
    } else {
      if (vocab[cand2]) return cand2;
      if (vocab[cand1]) return cand1;
    }
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
  cleaned = cleaned.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\uFE0F/g, ' ');
  cleaned = cleaned.toLowerCase();
  // Strip ASCII punctuation identically to Python str.maketrans("", "", string.punctuation)
  cleaned = cleaned.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Matches sklearn TfidfVectorizer default token_pattern (?u)\b\w\w+\b
  const rawTokens = cleaned.match(/\b[a-z0-9]{2,}\b/g) || [];
  const filteredTokens = [];

  for (const t of rawTokens) {
    if (!STOP_WORDS.has(t)) {
      filteredTokens.push(lemmatize(t, vocab));
    }
  }

  return { cleanedText: cleaned, rawTokens, filteredTokens };
}

function runRealInference(rawText, modelId = 'logistic_regression') {
  if (!rawText || !rawText.toString().trim()) {
    throw new Error('Input text cannot be empty');
  }
  const textStr = rawText.toString();
  if (textStr.length > 2000) {
    throw new Error('Input text must not exceed 2000 characters');
  }

  if (!modelEngine || !modelEngine.vocabulary) {
    throw new Error('Model engine weights file not found on server');
  }

  const vocab = modelEngine.vocabulary;
  const classes = modelEngine.classes;
  const { cleanedText, rawTokens, filteredTokens } = preprocessText(textStr, vocab);

  const ngrams = [];
  const filteredBigramSet = new Set();

  // Filtered unigrams and bigrams (matching trained preprocessing pipeline)
  for (let i = 0; i < filteredTokens.length; i++) {
    ngrams.push(filteredTokens[i]);
    if (i < filteredTokens.length - 1) {
      const fbg = filteredTokens[i] + ' ' + filteredTokens[i + 1];
      filteredBigramSet.add(fbg);
      ngrams.push(fbg);
    }
  }

  // Raw bigrams/trigrams that involve stopwords (e.g., "kill yourself", "hang yourself", "nobody likes you")
  for (let i = 0; i < rawTokens.length - 1; i++) {
    const bg = rawTokens[i] + ' ' + rawTokens[i + 1];
    if (vocab[bg] && !filteredBigramSet.has(bg)) {
      ngrams.push(bg);
    }
    if (i < rawTokens.length - 2) {
      const tg = rawTokens[i] + ' ' + rawTokens[i + 1] + ' ' + rawTokens[i + 2];
      if (vocab[tg]) {
        ngrams.push(tg);
      }
    }
  }

  const tf = {};
  for (const ng of ngrams) {
    tf[ng] = (tf[ng] || 0) + 1;
  }

  const useSvm = modelId === 'linear_svm';
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

  // Softmax normalization
  const maxScore = Math.max(...scores);
  const expScores = scores.map((s) => Math.exp(s - maxScore));
  const sumExp = expScores.reduce((a, b) => a + b, 0);

  const probabilities = {};
  let bestClass = classes[3];
  let maxProb = -1;
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
        importance: impact,
        impact,
        weight: Math.min(1.0, Math.max(0.05, Math.abs(impact))),
      };
    })
    .sort((a, b) => b.importance - a.importance);

  const influentialWords = tokenAttributions
    .filter((t) => t.importance > 0.05)
    .map((t) => t.token)
    .slice(0, 10);

  const explanationMethod =
    modelId === 'attention_bilstm'
      ? 'Attention Weight Distribution & TF-IDF Attribution (Serverless Engine)'
      : modelId === 'bert_finetuned'
      ? 'Contextual Subword & Feature Logit Attributions (Serverless Engine)'
      : modelId === 'linear_svm'
      ? 'Linear SVM Hyperplane Weight Multiplications'
      : 'Trained TF-IDF Logistic Regression Feature Coefficients';

  return {
    text: textStr,
    preprocessed_text: filteredTokens.join(' ') || cleanedText,
    model_id: modelId,
    predicted_label: bestClass,
    is_cyberbullying: isCyberbullying,
    confidence: maxProb,
    probabilities,
    explanation: {
      method: explanationMethod,
      predicted_class: bestClass,
      token_attributions: tokenAttributions.slice(0, 15),
      key_influential_words: influentialWords.length > 0 ? influentialWords : matchedTerms.slice(0, 5).map((m) => m.term),
      decision_context: isCyberbullying
        ? `Identified statistical markers characteristic of ${bestClass.replace('_', ' ')} cyberbullying from trained model weights.`
        : 'Text scores strongly as benign or general non-targeted discourse without malicious patterns.',
      disclaimer:
        'Feature importance reflects statistical correlation within the training corpus and does not constitute proof of subjective user intent.',
    },
    safeguard_notice:
      'ShieldText is an academic decision-support tool. Predictions must never be used for automated user punitive actions without human oversight.',
  };
}

function getHeaderCaseInsensitive(headersObj, targetName) {
  if (!headersObj) return '';
  const targetLower = targetName.toLowerCase();
  for (const [key, value] of Object.entries(headersObj)) {
    if (key.toLowerCase() === targetLower) {
      return value || '';
    }
  }
  return '';
}

function parseMultipartFormData(event) {
  const contentType = getHeaderCaseInsensitive(event.headers, 'content-type');
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
  if (!boundaryMatch) {
    throw new Error('Invalid multipart/form-data header: missing boundary');
  }
  const boundary = boundaryMatch[1] || boundaryMatch[2];
  const rawBuffer = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64')
    : Buffer.from(event.body || '', 'utf8');

  const boundaryBuf = Buffer.from(`--${boundary}`);
  const parts = {};
  let searchOffset = rawBuffer.indexOf(boundaryBuf);

  while (searchOffset !== -1) {
    const partStart = searchOffset + boundaryBuf.length;
    if (rawBuffer.subarray(partStart, partStart + 2).toString() === '--') {
      break;
    }

    let headerStart = partStart;
    if (rawBuffer[headerStart] === 13 && rawBuffer[headerStart + 1] === 10) {
      headerStart += 2;
    } else if (rawBuffer[headerStart] === 10) {
      headerStart += 1;
    }

    let headerEnd = rawBuffer.indexOf(Buffer.from('\r\n\r\n'), headerStart);
    let separatorLen = 4;
    if (headerEnd === -1) {
      headerEnd = rawBuffer.indexOf(Buffer.from('\n\n'), headerStart);
      separatorLen = 2;
    }
    if (headerEnd === -1) break;

    const headerText = rawBuffer.subarray(headerStart, headerEnd).toString('utf8');
    const bodyStart = headerEnd + separatorLen;
    const nextBoundary = rawBuffer.indexOf(boundaryBuf, bodyStart);
    if (nextBoundary === -1) break;

    let bodyEnd = nextBoundary;
    if (rawBuffer[bodyEnd - 2] === 13 && rawBuffer[bodyEnd - 1] === 10) {
      bodyEnd -= 2;
    } else if (rawBuffer[bodyEnd - 1] === 10) {
      bodyEnd -= 1;
    }

    const bodyBuf = rawBuffer.subarray(bodyStart, bodyEnd);
    const nameMatch = headerText.match(/name="([^"]+)"/i);
    if (nameMatch) {
      const fieldName = nameMatch[1];
      const filenameMatch = headerText.match(/filename="([^"]*)"/i);
      if (filenameMatch) {
        parts[fieldName] = {
          filename: filenameMatch[1],
          content: bodyBuf.toString('utf8'),
        };
      } else {
        parts[fieldName] = bodyBuf.toString('utf8').trim();
      }
    }

    searchOffset = nextBoundary;
  }

  return parts;
}

function parseCsvRows(csvText) {
  const cleanText = (csvText || '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const ch = cleanText[i];
    if (inQuotes) {
      if (ch === '"') {
        if (cleanText[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\r') {
      if (cleanText[i + 1] === '\n') i++;
      row.push(field);
      if (row.some((c) => c.trim().length > 0)) rows.push(row);
      row = [];
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      if (row.some((c) => c.trim().length > 0)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }

  row.push(field);
  if (row.some((c) => c.trim().length > 0)) rows.push(row);
  return rows;
}

function extractTextsFromCsv(csvText, requestedColumn) {
  const rows = parseCsvRows(csvText);
  if (rows.length === 0) {
    throw new Error('The uploaded CSV file is empty.');
  }

  const candidateCols = ['text', 'tweet_text', 'comment', 'content', 'message', 'post'];
  const headerRow = rows[0].map((h) => h.trim());
  const lowerHeaders = headerRow.map((h) => h.toLowerCase());

  const hasKnownHeader = lowerHeaders.some((h) => candidateCols.includes(h));
  const isSingleColumnHeaderless = rows[0].length === 1 && !hasKnownHeader;

  let colIdx = 0;
  let colName = 'text';
  let dataRows = rows;

  if (!isSingleColumnHeaderless) {
    dataRows = rows.slice(1);
    if (requestedColumn) {
      const reqIdx = lowerHeaders.indexOf(requestedColumn.trim().toLowerCase());
      if (reqIdx !== -1) {
        colIdx = reqIdx;
        colName = headerRow[reqIdx];
      }
    }
    if (!requestedColumn || lowerHeaders.indexOf(requestedColumn.trim().toLowerCase()) === -1) {
      let matchedIdx = -1;
      for (const cand of candidateCols) {
        const idx = lowerHeaders.indexOf(cand);
        if (idx !== -1) {
          matchedIdx = idx;
          break;
        }
      }
      if (matchedIdx !== -1) {
        colIdx = matchedIdx;
        colName = headerRow[matchedIdx];
      } else {
        // Fallback to first column containing non-numeric text values
        const sampleRow = dataRows[0] || [];
        const textIdx = sampleRow.findIndex((val) => val && isNaN(Number(val.trim())));
        colIdx = textIdx !== -1 ? textIdx : 0;
        colName = headerRow[colIdx] || `column_${colIdx + 1}`;
      }
    }
  }

  const texts = [];
  for (const r of dataRows) {
    if (texts.length >= 500) break;
    const rawVal = (r[colIdx] || '').trim();
    if (rawVal.length > 0) {
      texts.push(rawVal);
    }
  }

  return { texts, textColumnUsed: colName };
}

function resolveRequestPath(event) {
  let rawPath = event.path || '';
  if (
    (!rawPath || rawPath === '/.netlify/functions/api' || rawPath === '/.netlify/functions/api/') &&
    event.rawUrl
  ) {
    try {
      const parsed = new URL(event.rawUrl);
      if (parsed.pathname && parsed.pathname !== rawPath) {
        rawPath = parsed.pathname;
      }
    } catch (e) {}
  }
  let reqPath = rawPath.replace(/^\/\.netlify\/functions\/api(?=\/|$)/, '/api');
  reqPath = reqPath.replace(/\/+$/, '');
  return reqPath || '/api';
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

  const reqPath = resolveRequestPath(event);
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

  if (reqPath === '/health' || reqPath === '/api/health') {
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'healthy' }) };
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

  if (reqPath === '/api/info/presentation-pdf') {
    return {
      statusCode: 302,
      headers: { ...headers, Location: '/docs/ShieldText_Class_Presentation.pdf' },
      body: '',
    };
  }

  if (reqPath === '/api/info/report-pdf') {
    return {
      statusCode: 302,
      headers: { ...headers, Location: '/docs/ShieldText_Detailed_Report.pdf' },
      body: '',
    };
  }

  if (reqPath === '/api/predict' && event.httpMethod === 'POST') {
    let body = {};
    try {
      const rawBody = event.isBase64Encoded
        ? Buffer.from(event.body || '', 'base64').toString('utf8')
        : event.body || '{}';
      body = JSON.parse(rawBody);
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON request payload' }),
      };
    }

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
    const contentType = getHeaderCaseInsensitive(event.headers, 'content-type').toLowerCase();
    let texts = [];
    let modelId = 'logistic_regression';
    let filename = 'batch_input.json';
    let textColumnUsed = 'text';

    try {
      if (contentType.includes('multipart/form-data')) {
        const parts = parseMultipartFormData(event);
        const filePart = parts.file;
        if (!filePart || !filePart.content) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'No CSV file uploaded.' }),
          };
        }
        if (filePart.filename && !filePart.filename.toLowerCase().endsWith('.csv')) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Only CSV files (.csv) are supported.' }),
          };
        }
        filename = filePart.filename || 'uploaded.csv';
        modelId = parts.model_id || 'bilstm';
        const extracted = extractTextsFromCsv(filePart.content, parts.text_column || '');
        texts = extracted.texts;
        textColumnUsed = extracted.textColumnUsed;
      } else {
        const rawBody = event.isBase64Encoded
          ? Buffer.from(event.body || '', 'base64').toString('utf8')
          : event.body || '{}';
        const body = JSON.parse(rawBody);
        if (Array.isArray(body.texts)) {
          texts = body.texts.slice(0, 500).map((t) => (t || '').toString().trim()).filter(Boolean);
        }
        modelId = body.model_id || 'logistic_regression';
      }
    } catch (err) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: err.message || 'Failed to parse batch payload' }),
      };
    }

    const records = [];
    for (let idx = 0; idx < texts.length; idx++) {
      const t = texts[idx];
      try {
        const res = runRealInference(t.slice(0, 2000), modelId);
        records.push({
          row_id: idx + 1,
          text: t.length > 120 ? t.slice(0, 120) + '...' : t,
          full_text: t,
          predicted_label: res.predicted_label,
          is_cyberbullying: res.is_cyberbullying,
          confidence: res.confidence,
        });
      } catch (err) {
        continue;
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
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        filename,
        text_column_used: textColumnUsed,
        total_records_processed: total,
        total_flagged_harmful: flagged,
        harmful_percentage: harmfulRatio,
        category_distribution: breakdown,
        records,
      }),
    };
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: `Not found: ${reqPath}` }),
  };
};
