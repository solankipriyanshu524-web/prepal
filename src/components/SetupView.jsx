import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  Code2, 
  Mic, 
  Layers, 
  Trophy, 
  Check, 
  CheckCircle2, 
  Terminal, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Cpu,
  Eye
} from 'lucide-react';
import { INTERVIEW_TRACKS, EXPERIENCE_LEVELS, AI_PROVIDERS } from '../data/interviewTracks';

export default function SetupView({ 
  onStartInterview, 
  currentConfig, 
  onOpenSettings 
}) {
  const [selectedTrackId, setSelectedTrackId] = useState(INTERVIEW_TRACKS[0].id);
  const [selectedLevelId, setSelectedLevelId] = useState(EXPERIENCE_LEVELS[1].id);
  const [selectedLang, setSelectedLang] = useState('javascript');

  const selectedTrack = INTERVIEW_TRACKS.find(t => t.id === selectedTrackId) || INTERVIEW_TRACKS[0];
  const selectedLevel = EXPERIENCE_LEVELS.find(l => l.id === selectedLevelId) || EXPERIENCE_LEVELS[1];

  const handleStart = () => {
    onStartInterview({
      track: selectedTrack,
      level: selectedLevel,
      language: selectedLang
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Section */}
      <div className="relative text-center space-y-5 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen AI Technical Interview Prep</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Master Tech Interviews with an <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Adaptive AI Lead</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Experience real-time voice conversations, live Monaco code execution, an interactive system design whiteboard, and deep Big-O scorecard analytics.
        </p>

        {/* Engine status pill */}
        <div className="pt-2 flex items-center justify-center gap-3 text-xs text-slate-400">
          <span>Active Engine:</span>
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 hover:border-indigo-500 text-indigo-300 transition"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold capitalize">{currentConfig.provider} Mode</span>
            <span className="text-[10px] text-slate-500">(Click to change)</span>
          </button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white">Voice & Speech STT</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Voice synthesis and continuous browser recognition.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white">Monaco Code Editor</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">VS Code engine with syntax checking & console runner.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-purple-500/30 bg-purple-950/20 flex items-start gap-3 ring-1 ring-purple-500/20">
          <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
            <Eye className="w-4 h-4 animate-observer-beacon" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-purple-200">Over-the-Shoulder AI</h4>
            <p className="text-[11px] text-purple-300/80 mt-0.5 leading-snug">Proactively detects quadratic loops & stuck pauses live.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white">Design Whiteboard</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Diagram distributed systems with quick node stamps.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white">Big-O Scorecard</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Big-O complexity, rubrics, strengths & hire verdict.</p>
          </div>
        </div>
      </div>

      {/* Track & Configuration Form */}
      <div id="tracks" className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
        {/* Step 1: Track Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-mono font-bold">1</span>
                Choose Interview Track
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Select the target technical domain you want to practice</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INTERVIEW_TRACKS.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTrackId(t.id)}
                className={`cursor-pointer p-5 rounded-xl border transition-all ${
                  selectedTrackId === t.id
                    ? 'bg-gradient-to-br from-indigo-950/60 to-slate-900 border-indigo-500/80 ring-2 ring-indigo-500/20 shadow-lg'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">{t.role}</span>
                    <h4 className="text-base font-bold text-white mt-0.5">{t.title}</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{t.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    selectedTrackId === t.id ? 'border-indigo-500 bg-indigo-600' : 'border-slate-700'
                  }`}>
                    {selectedTrackId === t.id && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Experience Level & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-800">
          {/* Experience Level */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-mono font-bold">2</span>
              Candidate Level
            </h3>
            <div className="space-y-2">
              {EXPERIENCE_LEVELS.map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => setSelectedLevelId(lvl.id)}
                  className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition ${
                    selectedLevelId === lvl.id
                      ? 'bg-indigo-950/40 border-indigo-500/70'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-white">{lvl.label}</div>
                    <div className="text-xs text-slate-400">{lvl.desc}</div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedLevelId === lvl.id ? 'border-indigo-500 bg-indigo-600' : 'border-slate-700'
                  }`}>
                    {selectedLevelId === lvl.id && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Programming Language */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-mono font-bold">3</span>
              Primary Code Language
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedLang('javascript')}
                className={`p-4 rounded-xl border text-left transition ${
                  selectedLang === 'javascript'
                    ? 'bg-amber-500/10 border-amber-500/70 text-amber-300 ring-1 ring-amber-500/40'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-sm font-bold">JavaScript (ES6+)</div>
                <div className="text-xs text-slate-400 mt-1">Node & Web Standard</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLang('python')}
                className={`p-4 rounded-xl border text-left transition ${
                  selectedLang === 'python'
                    ? 'bg-blue-500/10 border-blue-500/70 text-blue-300 ring-1 ring-blue-500/40'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-sm font-bold">Python 3</div>
                <div className="text-xs text-slate-400 mt-1">Algorithms & Scripting</div>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Interview Simulation Rules:
              </div>
              <p>• Alex (AI Lead) will ask initial requirements & clarify approach.</p>
              <p>• You can speak through microphone or type answers directly.</p>
              <p>• You can run your code live or sketch architecture on the whiteboard.</p>
            </div>
          </div>
        </div>

        {/* Start CTA */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Selected: <span className="text-white font-semibold">{selectedTrack.title}</span> ({selectedLevel.label})
          </div>

          <button
            onClick={handleStart}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
          >
            <span>Enter Technical Interview Room</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
