import React, { useState } from 'react';
import { Shield, Home, Search, FileSpreadsheet, BarChart2, Network, Info } from 'lucide-react';
import HomeDashboard from './pages/HomeDashboard';
import LiveDetection from './pages/LiveDetection';
import BatchAnalysis from './pages/BatchAnalysis';
import ModelComparison from './pages/ModelComparison';
import NLPVisualizations from './pages/NLPVisualizations';
import ProjectInfo from './pages/ProjectInfo';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'live', label: 'Live Detection', icon: Search },
    { id: 'batch', label: 'Batch Analysis', icon: FileSpreadsheet },
    { id: 'comparison', label: 'Model Benchmark', icon: BarChart2 },
    { id: 'visualizations', label: 'NLP Visualizations', icon: Network },
    { id: 'info', label: 'Project Info & COs', icon: Info },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                ShieldText <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">CSE472</span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">NLP-Based Cyberbullying Detection System</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            8 Models Trained
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-100 gap-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && <HomeDashboard setActiveTab={setActiveTab} />}
        {activeTab === 'live' && <LiveDetection />}
        {activeTab === 'batch' && <BatchAnalysis />}
        {activeTab === 'comparison' && <ModelComparison />}
        {activeTab === 'visualizations' && <NLPVisualizations />}
        {activeTab === 'info' && <ProjectInfo />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-700">ShieldText System</span> — Developed for CSE472 Deep Learning for NLP (Session 2026–27)
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>FastAPI + PyTorch + React + Transformers</span>
            <span>&bull;</span>
            <span>Responsible AI Safeguards Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

