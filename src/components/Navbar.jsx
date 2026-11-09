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
        return { label: 'Gemini 1.5 Flash', color: 'bg-zinc-100 text-black border-black' };
      case 'ollama':
        return { label: 'Ollama (Local LLM)', color: 'bg-zinc-100 text-black border-black' };
      case 'openai':
        return { label: 'OpenAI GPT-4o-mini', color: 'bg-zinc-100 text-black border-black' };
      default:
        return { label: 'Demo Simulator', color: 'bg-zinc-100 text-black border-black' };
    }
  };

  const badge = getProviderBadge();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black bg-white/95 backdrop-blur-xl text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-black font-['Outfit']">PrepPal</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-zinc-100 text-black border border-black">
                AI Interviewer
              </span>
            </div>
          </div>
        </div>

        {/* Center: In-interview Timer & Status */}
        {inInterview && (
          <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-full bg-white border border-black shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Interview Live</span>
            <span className="text-xs font-mono font-bold text-black flex items-center gap-1">
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
                ? 'bg-zinc-50 text-black border-black shadow-sm' 
                : 'bg-zinc-100 text-zinc-600 border-black/40'
            }`}
            title={isBackendOnline ? 'FastAPI Python Backend Active on Port 8000 (Sandboxed Execution & PDF Generation ready)' : 'FastAPI Offline - Using In-Browser Sandbox'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isBackendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
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
            className="p-2 rounded-xl text-black hover:bg-zinc-100 border border-black transition shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            title="AI & Voice Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* End Interview / Help */}
          {inInterview ? (
            <button
              onClick={onEndInterview}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-600 hover:text-white text-rose-600 border border-black text-xs font-semibold transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              Finish Interview
            </button>
          ) : (
            <a
              href="#tracks"
              className="hidden sm:flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white border border-black text-xs font-semibold transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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
