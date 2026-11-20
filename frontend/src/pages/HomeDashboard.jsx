import React, { useEffect, useState } from 'react';
import { Shield, Brain, Database, BarChart3, AlertTriangle, ArrowRight, Layers, Cpu, Award } from 'lucide-react';
import { apiFetch } from '../api/client';

export default function HomeDashboard({ setActiveTab }) {
  const [summary, setSummary] = useState(null);
  const [datasetStats, setDatasetStats] = useState(null);

  useEffect(() => {
    apiFetch('/api/metrics/summary')
      .then((data) => setSummary(data.summary_table || []))
      .catch((err) => console.error(err));

    apiFetch('/api/visualizations/dataset')
      .then((data) => setDatasetStats(data))
      .catch((err) => console.error(err));
  }, []);

  const bestModel = summary && summary.length > 0 
    ? [...summary].sort((a, b) => b.accuracy - a.accuracy)[0]
    : { model_name: 'BiLSTM', accuracy: 0.8496, f1_macro: 0.8404 };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-8 md:p-12 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Award className="w-3.5 h-3.5" /> CSE472 Deep Learning for NLP — Academic Session 2026–27
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            ShieldText <span className="text-blue-400">Cyberbullying Detection</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            An advanced natural language processing system that distinguishes ordinary negative language from identity-targeted cyberbullying across 6 distinct categories, leveraging traditional statistical baselines, word embeddings, recurrent neural networks with attention, and transformer fine-tuning.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => setActiveTab('live')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-xl transition shadow-lg shadow-blue-600/30"
            >
              <Shield className="w-4 h-4" /> Live Text Analyzer
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium px-6 py-3 rounded-xl transition border border-slate-700"
            >
              <BarChart3 className="w-4 h-4" /> View Model Benchmark
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Dataset Records</span>
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">47,692</div>
          <div className="text-xs text-slate-500 mt-1">Wang et al. (2021) Cyberbullying Tweets</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Target Classes</span>
            <Layers className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">6 Categories</div>
          <div className="text-xs text-slate-500 mt-1">Religion, Age, Ethnicity, Gender, Other & Benign</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Trained Models</span>
            <Cpu className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">8 Architectures</div>
          <div className="text-xs text-slate-500 mt-1">LR, SVM, Word2Vec, LSTM, BiLSTM, Attn, BERT</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Test Accuracy</span>
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {(bestModel.accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500 mt-1">{bestModel.model_name}</div>
        </div>
      </div>

      {/* System Methodology Pipeline */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">NLP Architecture & Pipeline</h2>
          <p className="text-slate-600 text-sm mt-1">
            End-to-end multi-stage pipeline designed for the CSE472 Deep Learning for NLP curriculum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">1</div>
            <h3 className="font-semibold text-slate-900">Linguistic Preprocessing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Handles URLs, user mentions, hashtags, and emojis while deliberately preserving vital negation operators (not, never, no) to protect semantic polarity.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">2</div>
            <h3 className="font-semibold text-slate-900">Numerical Embeddings</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extracts n-gram TF-IDF vectors, trains custom Word2Vec CBOW and Skip-Gram representations, and projects embeddings to 2D using PCA and t-SNE.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">3</div>
            <h3 className="font-semibold text-slate-900">Neural Classification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              PyTorch LSTM, BiLSTM, and additive Self-Attention networks with Word2Vec weight initialization, plus fine-tuned DistilBERT transformer heads.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">4</div>
            <h3 className="font-semibold text-slate-900">Responsible AI & Explainability</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Token occlusion sensitivity, attention heatmap extraction, TF-IDF coefficient attributions, and non-retention privacy safeguards.
            </p>
          </div>
        </div>
      </div>

      {/* Model Benchmark Summary Table */}
      {summary && summary.length > 0 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Experimental Evaluation Leaderboard</h2>
              <p className="text-xs text-slate-500">Benchmark results on 6,863 held-out stratified test samples</p>
            </div>
            <button
              onClick={() => setActiveTab('comparison')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              Full Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Model Architecture</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Precision (Macro)</th>
                  <th className="py-3 px-4">Recall (Macro)</th>
                  <th className="py-3 px-4">Macro F1</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.map((row) => (
                  <tr key={row.model_id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-medium text-slate-800">{row.model_name}</td>
                    <td className="py-3 px-4 font-semibold text-blue-600">{(row.accuracy * 100).toFixed(2)}%</td>
                    <td className="py-3 px-4 text-slate-600">{(row.precision_macro * 100).toFixed(2)}%</td>
                    <td className="py-3 px-4 text-slate-600">{(row.recall_macro * 100).toFixed(2)}%</td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">{(row.f1_macro * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ethical Safeguard Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed">
          <span className="font-bold">Responsible AI Notice:</span> ShieldText provides predictive decision support and statistical pattern classification. Model predictions do not prove subjective human intent and must never be utilized to execute automated user suspensions or punitive actions without comprehensive human moderation review.
        </div>
      </div>
    </div>
  );
}

