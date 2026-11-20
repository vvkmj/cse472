import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle2, AlertTriangle, Sparkles, Send, RefreshCw, Info } from 'lucide-react';
import { apiFetch } from '../api/client';

export default function LiveDetection() {
  const [text, setText] = useState('');
  const [modelId, setModelId] = useState('bilstm');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch('/api/models')
      .then((data) => {
        setModels(data.models || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const samplePresets = [
    {
      title: 'Schoolyard Harassment (Age)',
      text: 'You are such a loser in high school nobody wants to sit with you at lunch haha dumb kid',
    },
    {
      title: 'Benign Negative Language',
      text: 'The weather today is terrible and my bus was late, but the lecture was helpful!',
    },
    {
      title: 'Ethno-Racial Harassment',
      text: 'People of your ethnic background should go back to where you came from, get out',
    },
    {
      title: 'Gender-Targeted Bullying',
      text: 'Girls have no brain for coding or technical engineering, stay out of technology',
    },
    {
      title: 'Neutral Friendly Message',
      text: 'Hey everyone, let us meet up in the library at 5 PM to finish our CSE472 project!',
    },
  ];

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model_id: modelId }),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (label, isHarmful) => {
    if (!isHarmful || label === 'not_cyberbullying') {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        badge: 'bg-emerald-500 text-white',
        text: 'text-emerald-700',
      };
    }
    switch (label) {
      case 'religion':
        return { bg: 'bg-amber-50 text-amber-900 border-amber-200', badge: 'bg-amber-600 text-white', text: 'text-amber-700' };
      case 'gender':
        return { bg: 'bg-rose-50 text-rose-900 border-rose-200', badge: 'bg-rose-600 text-white', text: 'text-rose-700' };
      case 'ethnicity':
        return { bg: 'bg-purple-50 text-purple-900 border-purple-200', badge: 'bg-purple-600 text-white', text: 'text-purple-700' };
      case 'age':
        return { bg: 'bg-blue-50 text-blue-900 border-blue-200', badge: 'bg-blue-600 text-white', text: 'text-blue-700' };
      default:
        return { bg: 'bg-red-50 text-red-900 border-red-200', badge: 'bg-red-600 text-white', text: 'text-red-700' };
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Live Cyberbullying Detection</h1>
        <p className="text-slate-600 text-sm mt-1">
          Input conversational text to inspect preprocessed tokens, model confidence, multi-class distribution, and token explainability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleAnalyze} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" /> Input Message / Comment
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Model:</span>
                <select
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or write a social media comment, chat message, or tweet here..."
              className="w-full p-4 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400">
                {text.length} / 2000 characters
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setText(''); setResult(null); }}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading || !text.trim()}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-600/20 text-sm"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Classify Content
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Preset Buttons */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Educational Test Samples
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setText(preset.text)}
                  className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition font-medium text-left"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Detection Result</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        getCategoryColor(result.predicted_label, result.is_cyberbullying).badge
                      }`}
                    >
                      {result.predicted_label.replace('_', ' ')}
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      {(result.confidence * 100).toFixed(1)}% Confidence
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-medium text-slate-400">Harmful Assessment</span>
                  <div className="text-sm font-bold flex items-center justify-end gap-1.5 mt-1">
                    {result.is_cyberbullying ? (
                      <span className="text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Potential Cyberbullying
                      </span>
                    ) : (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Non-Bullying / Benign
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Preprocessing comparison */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Preprocessed Tokens (Preserving Negations & Emojis)
                </span>
                <div className="p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-700 border border-slate-200">
                  {result.preprocessed_text || 'None'}
                </div>
              </div>

              {/* Multi-class Probability Bars */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Class Probability Distribution
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(result.probabilities).map(([cname, prob]) => {
                    const isSelected = cname === result.predicted_label;
                    return (
                      <div
                        key={cname}
                        className={`p-3 rounded-xl border ${
                          isSelected ? 'border-blue-300 bg-blue-50/50' : 'border-slate-100 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="capitalize">{cname.replace('_', ' ')}</span>
                          <span className={isSelected ? 'text-blue-700 font-bold' : 'text-slate-600'}>
                            {(prob * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isSelected ? 'bg-blue-600' : 'bg-slate-400'
                            }`}
                            style={{ width: `${Math.max(prob * 100, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explainability Section */}
              {result.explanation && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" /> {result.explanation.method}
                    </span>
                  </div>

                  {/* Attention Weights Token Heatmap */}
                  {result.explanation.all_tokens_with_weights && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500">
                        Token attention intensity (darker background indicates stronger additive attention weight):
                      </p>
                      <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        {result.explanation.all_tokens_with_weights.map((t, idx) => {
                          const intensity = Math.min(Math.max(t.attention_weight * 5, 0.1), 1);
                          return (
                            <span
                              key={idx}
                              title={`Attention: ${t.attention_weight}`}
                              className="px-2 py-1 rounded text-xs font-medium cursor-help transition"
                              style={{
                                backgroundColor: `rgba(2, 132, 199, ${intensity})`,
                                color: intensity > 0.4 ? '#ffffff' : '#0f172a',
                              }}
                            >
                              {t.token}
                              <span className="text-[9px] opacity-75 ml-1">
                                {t.attention_weight.toFixed(2)}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Token Perturbation / Feature Attribution List */}
                  {result.explanation.token_impacts && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500">
                        Top influential tokens identified via leave-one-token-out occlusion:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {result.explanation.token_impacts.slice(0, 6).map((item, idx) => (
                          <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                            <span className="font-bold text-slate-800">{item.token}</span>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Importance: +{(item.importance * 100).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TF-IDF Feature Weights */}
                  {result.explanation.token_attributions && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500">
                        Linear model class coefficients for constituent n-grams:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.explanation.token_attributions.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 font-medium"
                          >
                            {item.token}{' '}
                            <span className="text-blue-500 font-mono text-[10px]">
                              (+{item.importance})
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.explanation.disclaimer && (
                    <p className="text-[11px] text-slate-400 italic">
                      * {result.explanation.disclaimer}
                    </p>
                  )}
                </div>
              )}

              {/* Safeguard Notice */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{result.safeguard_notice}</span>
              </div>
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" /> Cyberbullying Class Definitions
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-blue-700">Age</span>
                <p>Harassment targeting age, school status, grade hierarchy, or vulnerability.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-purple-700">Ethnicity</span>
                <p>Racial, nationality-based, or xenophobic disparagement.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-rose-700">Gender</span>
                <p>Misogynistic attacks, sexist tropes, or gender identity harassment.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-amber-700">Religion</span>
                <p>Attacks targeting religious beliefs, scriptures, or communities.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700">Other Cyberbullying</span>
                <p>Personal hostility not centered on the protected identity categories.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-emerald-700">Not Cyberbullying</span>
                <p>Benign chatter, negative sentiment, criticism, or non-bullying discussion.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

