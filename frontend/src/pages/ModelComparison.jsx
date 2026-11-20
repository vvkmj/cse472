import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { BarChart3, Grid, Award, CheckCircle, TrendingUp, Cpu } from 'lucide-react';
import { apiFetch } from '../api/client';

export default function ModelComparison() {
  const [metricsData, setMetricsData] = useState({});
  const [summaryTable, setSummaryTable] = useState([]);
  const [selectedMatrixModel, setSelectedMatrixModel] = useState('bilstm');

  useEffect(() => {
    apiFetch('/api/metrics')
      .then((data) => setMetricsData(data.metrics || {}))
      .catch((err) => console.error(err));

    apiFetch('/api/metrics/summary')
      .then((data) => setSummaryTable(data.summary_table || []))
      .catch((err) => console.error(err));
  }, []);

  const chartData = summaryTable.map((item) => ({
    name: item.model_name.replace(' (TF-IDF Baseline)', '').replace(' (Unidirectional)', ''),
    Accuracy: Number((item.accuracy * 100).toFixed(1)),
    'Macro F1': Number((item.f1_macro * 100).toFixed(1)),
    Precision: Number((item.precision_macro * 100).toFixed(1)),
    Recall: Number((item.recall_macro * 100).toFixed(1)),
  }));

  const activeModelMetrics = metricsData[selectedMatrixModel] || null;
  const classNames = activeModelMetrics?.class_names || [
    'age', 'ethnicity', 'gender', 'not_cyberbullying', 'other_cyberbullying', 'religion'
  ];
  const matrix = activeModelMetrics?.confusion_matrix || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Model Evaluation & Benchmark Comparison</h1>
        <p className="text-slate-600 text-sm mt-1">
          Rigorous empirical evaluation of 8 NLP architectures trained on the Wang et al. (2021) dataset and evaluated on the exact same 6,863 held-out stratified test set.
        </p>
      </div>

      {/* Main Benchmark Comparison Chart */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" /> Architectural Performance Benchmark
          </h2>
          <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full border border-blue-200">
            Held-Out Test Set (N = 6,863)
          </span>
        </div>

        <div className="h-96 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} interval={0} tick={{ fontSize: 11 }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${value}%`]} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="Accuracy" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Macro F1" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Precision" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recall" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Benchmark Summary Table */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Empirical Performance Results Table</h2>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Model Architecture</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Macro Precision</th>
                <th className="py-3 px-4">Macro Recall</th>
                <th className="py-3 px-4">Macro F1</th>
                <th className="py-3 px-4">Weighted F1</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaryTable.map((row) => (
                <tr key={row.model_id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900">{row.model_name}</td>
                  <td className="py-3 px-4 font-bold text-blue-600">{(row.accuracy * 100).toFixed(2)}%</td>
                  <td className="py-3 px-4 text-slate-700">{(row.precision_macro * 100).toFixed(2)}%</td>
                  <td className="py-3 px-4 text-slate-700">{(row.recall_macro * 100).toFixed(2)}%</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">{(row.f1_macro * 100).toFixed(2)}%</td>
                  <td className="py-3 px-4 text-slate-700">{(row.f1_weighted * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix Interactive Heatmap */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Grid className="w-5 h-5 text-purple-600" /> Interactive Confusion Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any architecture to inspect per-class true positives and misclassification distribution.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Select Model:</span>
            <select
              value={selectedMatrixModel}
              onChange={(e) => setSelectedMatrixModel(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              {Object.keys(metricsData).map((k) => (
                <option key={k} value={k}>
                  {metricsData[k].model_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {matrix.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="mx-auto border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="p-2"></th>
                    <th colSpan={classNames.length} className="p-2 text-center font-bold text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                      Predicted Label &rarr;
                    </th>
                  </tr>
                  <tr>
                    <th className="p-2 text-left font-bold text-slate-500 uppercase text-[11px]">True Label &darr;</th>
                    {classNames.map((c) => (
                      <th key={c} className="p-2 font-bold text-slate-700 capitalize text-center w-24">
                        {c.replace('_', ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row, rowIdx) => {
                    const rowSum = row.reduce((a, b) => a + b, 0);
                    return (
                      <tr key={rowIdx}>
                        <td className="p-2 font-bold text-slate-700 capitalize text-right pr-4">
                          {classNames[rowIdx].replace('_', ' ')}
                        </td>
                        {row.map((cellVal, colIdx) => {
                          const isDiagonal = rowIdx === colIdx;
                          const ratio = rowSum > 0 ? cellVal / rowSum : 0;
                          return (
                            <td
                              key={colIdx}
                              className={`p-3 text-center border border-slate-100 transition font-mono ${
                                isDiagonal
                                  ? 'bg-blue-600 text-white font-bold'
                                  : ratio > 0.1
                                  ? 'bg-rose-100 text-rose-900 font-semibold'
                                  : 'bg-slate-50 text-slate-600'
                              }`}
                              style={{
                                opacity: isDiagonal ? Math.max(ratio, 0.4) : undefined,
                              }}
                            >
                              <div className="text-xs">{cellVal}</div>
                              <div className="text-[9px] opacity-80">{(ratio * 100).toFixed(0)}%</div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Per-class metrics breakdown from report */}
            {activeModelMetrics?.class_report && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-3">
                  Per-Class Classification Report ({activeModelMetrics.model_name})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {classNames.map((c) => {
                    const report = activeModelMetrics.class_report[c] || {};
                    return (
                      <div key={c} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="font-bold text-slate-800 capitalize truncate">{c.replace('_', ' ')}</div>
                        <div className="text-[11px] text-slate-600">
                          Precision: <span className="font-semibold text-blue-600">{((report.precision || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Recall: <span className="font-semibold text-purple-600">{((report.recall || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          F1: <span className="font-semibold text-emerald-600">{((report['f1-score'] || 0) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">Loading confusion matrix telemetry...</div>
        )}
      </div>

      {/* Deep Architectural Discussion */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Academic Comparison & Architectural Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-800 text-sm">Traditional Baselines (TF-IDF)</h3>
            <p>
              Logistic Regression and Linear SVM achieve strong performance (84.00% and 83.46% accuracy). They excel at detecting explicit lexical slurs and targeted identity keywords, but cannot model complex sequential context or long-range dependencies.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-800 text-sm">Recurrent Neural Models (LSTM / BiLSTM)</h3>
            <p>
              Bidirectional LSTM captures both preceding and succeeding context tokens, achieving the top overall test accuracy of 84.96%. Masked max-pooling successfully prevents pad token state dilution. Additive attention provides explainability while maintaining 84.10% accuracy.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-800 text-sm">Transformers (DistilBERT)</h3>
            <p>
              DistilBERT leverages bidirectional self-attention pre-trained on large English corpora. Fine-tuning on social media text achieves 78.20% accuracy with rapid subword tokenization, capturing subtle conversational syntax and punctuation patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

