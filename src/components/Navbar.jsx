import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Settings, 
  Sparkles, 
  Clock, 
  Cpu, 
  ChevronRight,
  Code2,
  Server,
  Zap
} from 'lucide-react';

export default function Navbar({ 
  inInterview, 
  onEndInterview, 
  onOpenSettings, 
  provider, 
  elapsedSeconds = 0 
}) {
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  useEffect(() => {
    // Check FastAPI health
    fetch('/api/health')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.status === 'healthy') {
          setIsBackendOnline(true);
        }
      })
      .catch(() => {
        setIsBackendOnline(false);
      });
  }, []);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getProviderBadge = () => {
    switch (provider) {
      case 'gemini':
        return { label: 'Gemini 1.5 Flash', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'ollama':
        return { label: 'Ollama (Local LLM)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'openai':
        return { label: 'OpenAI GPT-4o-mini', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
      default:
        return { label: 'Demo Simulator', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    }
  };

  const badge = getProviderBadge();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white font-['Outfit']">PrepPal</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI Interviewer
              </span>
            </div>
          </div>
        </div>

        {/* Center: In-interview Timer & Status */}
        {inInterview && (
          <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Interview Live</span>
            <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {formatTime(elapsedSeconds)}
            </span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* FastAPI Server Indicator */}
          <div 
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
              isBackendOnline 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-sm shadow-emerald-500/10' 
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
            }`}
            title={isBackendOnline ? 'FastAPI Python Backend Active on Port 8000 (Sandboxed Execution & PDF Generation ready)' : 'FastAPI Offline - Using In-Browser Sandbox'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <Server className="w-3 h-3" />
            <span>{isBackendOnline ? 'FastAPI :8000' : 'In-Browser'}</span>
          </div>

          {/* Provider pill */}
          <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${badge.color}`}>
            <Cpu className="w-3.5 h-3.5" />
            <span>{badge.label}</span>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
            title="AI & Voice Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* End Interview / Help */}
          {inInterview ? (
            <button
              onClick={onEndInterview}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition"
            >
              Finish Interview
            </button>
          ) : (
            <a
              href="#tracks"
              className="hidden sm:flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition"
            >
              <span>Explore Tracks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
