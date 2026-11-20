import React, { useState, useEffect } from 'react';
import { BookOpen, Shield, Award, CheckCircle2, AlertTriangle, FileText, Cpu, Database, Download, Presentation } from 'lucide-react';
import { apiFetch } from '../api/client';

export default function ProjectInfo() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    apiFetch('/api/info')
      .then((data) => setInfo(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Project Information & Academic Alignment</h1>
          <p className="text-slate-600 text-sm mt-1">
            Detailed documentation of system methodology, CSE472 Course Outcome alignment, responsible AI safeguards, and defense resources.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/docs/ShieldText_Class_Presentation.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-sm transition"
          >
            <Presentation className="w-4 h-4" /> Defense Slides (PDF)
          </a>
          <a
            href="/docs/ShieldText_Detailed_Report.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4" /> Full Project Report (PDF)
          </a>
        </div>
      </div>

      {/* Presentation & Report PDF Download Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-blue-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-700/50">
              Official Academic Deliverables &bull; CSE472 (Session 2026–27)
            </span>
            <h2 className="text-xl font-bold text-white">Class Presentation Deck & Comprehensive Project Report</h2>
            <p className="text-xs text-blue-100/90 leading-relaxed">
              Standardized academic PDFs prepared for class defense and examination. Contains all 12 presentation slides, mathematical derivations, empirical test benchmarks (N = 6,863), masked max-pooling sequence explanations, and viva voce defense questions.
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <a
              href="/docs/ShieldText_Class_Presentation.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs py-3 px-5 rounded-xl transition shadow-lg"
            >
              <Presentation className="w-4 h-4" /> 12-Slide Defense Deck
            </a>
            <a
              href="/docs/ShieldText_Detailed_Report.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-3 px-5 rounded-xl border border-white/20 transition backdrop-blur-sm"
            >
              <FileText className="w-4 h-4 text-blue-300" /> Full Academic Report
            </a>
          </div>
        </div>
      </div>

      {/* Academic Alignment: CO1 - CO6 */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" /> CSE472 Course Outcome (CO) Mapping
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Explicit verification demonstrating how ShieldText satisfies all core components of Deep Learning for Natural Language Processing.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-20">Outcome</th>
                <th className="py-3 px-4 w-56">Syllabus Topic</th>
                <th className="py-3 px-4">Project Implementation in ShieldText</th>
                <th className="py-3 px-4 w-28 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {info?.course_mapping?.map((co) => (
                <tr key={co.code} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-blue-600">{co.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{co.title}</td>
                  <td className="py-3.5 px-4 text-slate-600 leading-relaxed">{co.implementation}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> {co.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset & Verification */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" /> Verified Dataset Specification
        </h2>
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            <span className="font-bold text-slate-800">Dataset Title:</span> Cyberbullying Classification Dataset (Wang et al., 2021).
          </p>
          <p>
            <span className="font-bold text-slate-800">Academic Citation:</span> Wang, J., et al. (2021). <em>"Automated Cyberbullying Detection on Social Media: A Deep Learning Approach."</em> Published on Kaggle & Hugging Face Hub (CC BY 4.0).
          </p>
          <p>
            <span className="font-bold text-slate-800">Dataset Volume:</span> 47,692 original tweets; 1,675 exact duplicates eliminated to prevent train-test data leakage; 45,749 clean records partitioned into stratified splits (70% Train, 15% Validation, 15% Test).
          </p>
          <p>
            <span className="font-bold text-slate-800">Target Categories:</span> Religion (anti-religious harassment), Ethnicity (racist/xenophobic slurs), Gender (sexist/misogynistic bullying), Age (schoolyard teen bullying), Other Cyberbullying (general hostility), and Not Cyberbullying (benign chatter or non-targeted negative remarks).
          </p>
        </div>
      </div>

      {/* Responsible AI Safeguards */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-600" /> Responsible AI & Moderation Safeguards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {info?.responsible_ai_safeguards?.map((safe, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-xs text-slate-800">{safe.title}</span>
              <p className="text-xs text-slate-600 leading-relaxed">{safe.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Limitations & Future Scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Known Technical Limitations
          </h2>
          <ul className="list-disc list-inside space-y-2 text-xs text-slate-600 leading-relaxed">
            <li><strong>Sarcasm and Irony:</strong> Subtle sarcasm without explicit slurs can evade superficial n-gram or word-vector filters.</li>
            <li><strong>Reclaimed Slurs & AAVE:</strong> In-group colloquial language can produce false positives if demographic context is absent.</li>
            <li><strong>Cross-Platform Domain Shift:</strong> Models trained on Twitter data may experience slight performance decay on short gaming chats or long forum posts.</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" /> Future Improvements & Extensions
          </h2>
          <ul className="list-disc list-inside space-y-2 text-xs text-slate-600 leading-relaxed">
            <li><strong>Contextual Conversational Threads:</strong> Evaluating parent-child tweet thread context rather than isolated single sentences.</li>
            <li><strong>Multilingual Adaptation:</strong> Deploying XLM-RoBERTa for cross-lingual zero-shot cyberbullying detection in Indic and European languages.</li>
            <li><strong>Adversarial Robustness Testing:</strong> Hardening models against intentional leetspeak obfuscations (e.g., "b*lly", "h8").</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

