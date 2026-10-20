import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Cpu, 
  ExternalLink, 
  Check, 
  X, 
  Volume2, 
  Sparkles,
  Server,
  ShieldAlert
} from 'lucide-react';
import { AI_PROVIDERS } from '../data/interviewTracks';

export default function SettingsModal({ config, onSave, onClose }) {
  const [provider, setProvider] = useState(config.provider || 'demo');
  const [geminiKey, setGeminiKey] = useState(config.geminiKey || '');
  const [openAiKey, setOpenAiKey] = useState(config.openAiKey || '');
  const [ollamaUrl, setOllamaUrl] = useState(config.ollamaUrl || 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState(config.ollamaModel || 'llama3.2');
  const [autoSpeak, setAutoSpeak] = useState(config.autoSpeak !== false);

  const handleSave = () => {
    onSave({
      provider,
      geminiKey,
      openAiKey,
      ollamaUrl,
      ollamaModel,
      autoSpeak
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">AI Engine & Voice Settings</h3>
              <p className="text-xs text-slate-400">Configure Cloud AI (Gemini), Local LLM (Ollama), or Demo Mode</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Select AI Provider</label>
            <div className="grid grid-cols-1 gap-2.5">
              {AI_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={`flex items-start justify-between p-3 rounded-xl border text-left transition ${
                    provider === p.id 
                      ? 'bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/50' 
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{p.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{p.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${provider === p.id ? 'border-indigo-500 bg-indigo-600' : 'border-slate-600'}`}>
                    {provider === p.id && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Provider Inputs */}
          {provider === 'gemini' && (
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" /> Google Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  Get Free Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-500">Your key stays stored locally in your browser. Never sent to any third-party server.</p>
            </div>
          )}

          {provider === 'ollama' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <Server className="w-3.5 h-3.5 text-indigo-400" /> Local Ollama Endpoint
              </div>
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 whitespace-nowrap">Model Name:</label>
                <input
                  type="text"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llama3.2"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div className="p-2.5 rounded bg-slate-900/90 text-[11px] text-slate-400 flex items-start gap-2 border border-slate-800">
                <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Make sure you ran <code className="text-indigo-300 font-mono">ollama run {ollamaModel}</code> in your terminal.</span>
              </div>
            </div>
          )}

          {provider === 'openai' && (
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" /> OpenAI API Key
                </label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  OpenAI Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={openAiKey}
                onChange={(e) => setOpenAiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          )}

          {/* Voice Preferences */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-xs font-semibold text-white">Auto Text-to-Speech (TTS)</div>
                <div className="text-[11px] text-slate-400">Interviewer automatically speaks questions aloud</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => setAutoSpeak(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-950 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
          >
            <Check className="w-3.5 h-3.5" /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
