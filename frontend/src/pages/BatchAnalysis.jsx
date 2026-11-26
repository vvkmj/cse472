import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Download, AlertCircle, CheckCircle2, RefreshCw, BarChart2, Shield } from 'lucide-react';
import { apiFetch } from '../api/client';

export default function BatchAnalysis() {
  const [file, setFile] = useState(null);
  const [modelId, setModelId] = useState('bilstm');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch('/api/models')
      .then((data) => setModels(data.models || []))
      .catch((err) => console.error(err));
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.toLowerCase().endsWith('.csv')) {
      setFile(selected);
      setError(null);
    } else {
      setError('Please select a valid CSV file (.csv).');
      setFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_id', modelId);

    try {
      const data = await apiFetch('/api/batch', {
        method: 'POST',
        body: formData,
      });

      setResult(data);
    } catch (err) {
      setError(err.message || 'Batch analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!result || !result.records) return;

    const headers = ['Row_ID', 'Text', 'Predicted_Label', 'Confidence', 'Is_Cyberbullying'];
    const rows = result.records.map((r) => [
      r.row_id,
      `"${r.full_text.replace(/"/g, '""')}"`,
      r.predicted_label,
      r.confidence,
      r.is_cyberbullying ? 'TRUE' : 'FALSE',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shieldtext_batch_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Batch Text Analysis</h1>
        <p className="text-slate-600 text-sm mt-1">
          Upload a CSV file containing social media posts, comments, or customer transcripts to perform bulk cyberbullying classification and export annotated findings.
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Classification Model
              </label>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Sample Test Template
              </label>
              <div className="text-xs text-slate-500 p-3 bg-slate-50 rounded-xl border border-slate-200">
                Supports standard CSV with any column named <code>text</code>, <code>comment</code>, or <code>tweet_text</code>.
              </div>
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-8 text-center bg-slate-50/50 transition">
            <UploadCloud className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <div className="text-sm font-semibold text-slate-700">
              {file ? (
                <span className="text-blue-600 font-bold">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              ) : (
                'Drag and drop your CSV file here, or browse files'
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Max 500 rows per batch session for real-time inference</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mt-4 block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !file}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-xl transition shadow-md shadow-blue-600/20 text-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Processing Batch Records...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Start Batch Classification
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Batch Results */}
      {result && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Batch Processing Summary</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Processed {result.total_records_processed} rows from <code>{result.filename || file?.name || 'uploaded.csv'}</code> using column <code>{result.text_column_used || 'text'}</code>
              </p>
            </div>
            <button
              onClick={downloadCSV}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-xl transition shadow-sm text-xs"
            >
              <Download className="w-4 h-4" /> Export CSV Results
            </button>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Total Evaluated</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{result.total_records_processed}</div>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-xs text-rose-600 font-medium">Potential Cyberbullying</span>
              <div className="text-2xl font-bold text-rose-700 mt-1">{result.total_flagged_harmful}</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-xs text-blue-600 font-medium">Harmful Proportion</span>
              <div className="text-2xl font-bold text-blue-700 mt-1">{result.harmful_percentage}%</div>
            </div>
          </div>

          {/* Category Distribution Chips */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Category Distribution
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(result.category_distribution || {}).map(([cat, count]) => (
                <div key={cat} className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200">
                  <span className="capitalize">{cat.replace('_', ' ')}:</span> <span className="text-blue-600">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <th className="py-3 px-4 w-16">#</th>
                  <th className="py-3 px-4">Sample Text</th>
                  <th className="py-3 px-4">Predicted Category</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4 text-center">Harmful Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(result.records || []).map((r) => (
                  <tr key={r.row_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-4 font-mono text-slate-400">{r.row_id}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800 max-w-md truncate">
                      {r.text}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                        {r.predicted_label.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-700">
                      {(r.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {r.is_cyberbullying ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5" /> Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Safe
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

