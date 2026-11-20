import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, BarChart, Bar } from 'recharts';
import { Sparkles, Network, BookOpen, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { apiFetch } from '../api/client';

export default function NLPVisualizations() {
  const [word2vecData, setWord2vecData] = useState(null);
  const [datasetStats, setDatasetStats] = useState(null);
  const [prepDemo, setPrepDemo] = useState(null);
  const [projType, setProjType] = useState('tsne'); // 'tsne' or 'pca'
  const [activeModel, setActiveModel] = useState('cbow'); // 'cbow' or 'skipgram'

  useEffect(() => {
    apiFetch('/api/visualizations/word2vec')
      .then((data) => setWord2vecData(data))
      .catch((err) => console.error(err));

    apiFetch('/api/visualizations/dataset')
      .then((data) => setDatasetStats(data))
      .catch((err) => console.error(err));

    apiFetch('/api/visualizations/preprocessing')
      .then((data) => setPrepDemo(data))
      .catch((err) => console.error(err));
  }, []);

  const coordsKey = activeModel === 'cbow' ? 'cbow_coords' : 'skipgram_coords';
  const rawCoords = word2vecData?.visualizations?.[coordsKey] || [];

  const scatterData = rawCoords.map((item) => ({
    x: projType === 'tsne' ? item.tsne_x : item.pca_x,
    y: projType === 'tsne' ? item.tsne_y : item.pca_y,
    word: item.word,
  }));

  const classDistData = datasetStats?.train_class_distribution
    ? Object.entries(datasetStats.train_class_distribution).map(([cat, count]) => ({
        category: cat.replace('_', ' '),
        count,
      }))
    : [];

  const analogies = word2vecData?.comparison?.analogies || [];
  const similarities = word2vecData?.comparison?.[activeModel]?.semantic_similarities || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900">NLP Representations & Visualizations</h1>
        <p className="text-slate-600 text-sm mt-1">
          Explore distributed word vector geometries, semantic similarity clusters, linguistic preprocessing stages, and corpus class distributions.
        </p>
      </div>

      {/* 2D Embedding Scatter Plot */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-600" /> 2D Word Embedding Projection
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualizing semantic clustering of vocabulary words trained via Word2Vec.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Model switch */}
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                onClick={() => setActiveModel('cbow')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  activeModel === 'cbow' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-600'
                }`}
              >
                CBOW
              </button>
              <button
                onClick={() => setActiveModel('skipgram')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  activeModel === 'skipgram' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-600'
                }`}
              >
                Skip-Gram
              </button>
            </div>

            {/* Projection switch */}
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                onClick={() => setProjType('tsne')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  projType === 'tsne' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-600'
                }`}
              >
                t-SNE 2D
              </button>
              <button
                onClick={() => setProjType('pca')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  projType === 'pca' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-600'
                }`}
              >
                PCA 2D
              </button>
            </div>
          </div>
        </div>

        <div className="h-96 w-full bg-slate-50/50 rounded-xl border border-slate-100 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" dataKey="x" name="Dimension 1" tick={{ fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="Dimension 2" tick={{ fontSize: 11 }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-1">
                        <span className="font-bold text-blue-300 font-mono text-sm">{data.word}</span>
                        <div className="text-[10px] text-slate-300">
                          X: {data.x.toFixed(2)}, Y: {data.y.toFixed(2)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Words" data={scatterData} fill="#2563eb">
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 3 === 0 ? '#2563eb' : index % 3 === 1 ? '#7c3aed' : '#059669'}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Semantic Similarities & Word Analogies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Semantic Similarities */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Word2Vec Nearest Neighbors ({activeModel.toUpperCase()})
          </h2>
          <div className="space-y-3">
            {Object.entries(similarities).slice(0, 4).map(([w, neighbors]) => (
              <div key={w} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-xs text-blue-700 uppercase">Target: "{w}"</span>
                <div className="flex flex-wrap gap-1.5">
                  {neighbors.map((n, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px]">
                      {n.word} <span className="text-blue-500 font-mono text-[9px]">({(n.similarity * 100).toFixed(0)}%)</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Word Analogies */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Network className="w-4 h-4 text-emerald-600" /> Vector Analogy Experiments
          </h2>
          <div className="space-y-3">
            {analogies.map((an, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-mono font-bold text-slate-800">{an.analogy}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">CBOW Prediction</span>
                    <span className="font-semibold text-blue-600">{an.cbow_prediction}</span>{' '}
                    <span className="text-[10px] text-slate-400">({an.cbow_score})</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Skip-Gram Prediction</span>
                    <span className="font-semibold text-purple-600">{an.sg_prediction}</span>{' '}
                    <span className="text-[10px] text-slate-400">({an.sg_score})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dataset Class Distribution Chart */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" /> Dataset Class Balance Distribution
        </h2>
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classDistData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 6000]} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Preprocessing Pipeline Breakdown & Academic Tradeoffs */}
      {prepDemo && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Preprocessing Pipeline Demonstration & Tradeoffs
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Step-by-step transformation demonstrating how social media text is normalized across model families.
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">1. Raw Input Text</span>
              <span className="text-slate-900 font-sans">{prepDemo.demonstration.original_text}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">2. URLs, Mentions & Emojis Handled</span>
              <span className="text-slate-800">{prepDemo.demonstration.step1_url_mention_emoji_normalized}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">3. Punctuation Cleaned & Tokenized</span>
              <span className="text-slate-800">[{prepDemo.demonstration.step4_tokens.slice(0, 10).join(', ')}...]</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">4. Stopwords Filtered (Preserving Negations!)</span>
              <span className="text-blue-700 font-semibold">[{prepDemo.demonstration.step5_stopwords_filtered_preserving_negation.join(', ')}]</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-blue-500 block text-[10px] uppercase font-sans font-bold">5. Classical Models Final Lemmatized Vector</span>
              <span className="text-blue-900 font-bold">{prepDemo.demonstration.classical_pipeline_output}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Academic Preprocessing Trade-offs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(prepDemo.tradeoffs).map(([title, desc]) => (
                <div key={title} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-xs text-slate-800">{title}</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

