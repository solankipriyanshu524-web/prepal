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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden text-black">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 border-b border-black">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white text-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-black">AI Engine & Voice Settings</h3>
              <p className="text-xs text-zinc-600">Configure Cloud AI (Gemini), Local LLM (Ollama), or Demo Mode</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-black hover:bg-zinc-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto bg-white">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-black uppercase tracking-wider">Select AI Provider</label>
            <div className="grid grid-cols-1 gap-2.5">
              {AI_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={`flex items-start justify-between p-3 rounded-xl border-2 text-left transition ${
                    provider === p.id 
                      ? 'bg-zinc-100 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                      : 'bg-white border-black/30 hover:border-black'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-black">{p.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-black border border-black font-semibold">
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1">{p.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${provider === p.id ? 'border-black bg-black' : 'border-zinc-400 bg-white'}`}>
                    {provider === p.id && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Provider Inputs */}
          {provider === 'gemini' && (
            <div className="space-y-2 p-3.5 rounded-xl bg-zinc-50 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-black flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-black" /> Google Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-zinc-800 underline font-semibold hover:text-black flex items-center gap-1"
                >
                  Get Free Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 text-sm bg-white border border-black rounded-lg text-black placeholder-zinc-500 focus:outline-none font-mono"
              />
              <p className="text-[11px] text-zinc-500">Your key stays stored locally in your browser. Never sent to any third-party server.</p>
            </div>
          )}

          {provider === 'ollama' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-zinc-50 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-black">
                <Server className="w-3.5 h-3.5 text-black" /> Local Ollama Endpoint
              </div>
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full px-3 py-2 text-sm bg-white border border-black rounded-lg text-black font-mono focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-700 font-medium whitespace-nowrap">Model Name:</label>
                <input
                  type="text"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llama3.2"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-black rounded-lg text-black font-mono"
                />
              </div>
              <div className="p-2.5 rounded bg-white text-[11px] text-zinc-700 flex items-start gap-2 border border-black">
                <Cpu className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <span>Make sure you ran <code className="text-black font-mono font-bold">ollama run {ollamaModel}</code> in your terminal.</span>
              </div>
            </div>
          )}

          {provider === 'openai' && (
            <div className="space-y-2 p-3.5 rounded-xl bg-zinc-50 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-black flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-black" /> OpenAI API Key
                </label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-zinc-800 underline font-semibold hover:text-black flex items-center gap-1"
                >
                  OpenAI Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={openAiKey}
                onChange={(e) => setOpenAiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 text-sm bg-white border border-black rounded-lg text-black placeholder-zinc-500 focus:outline-none font-mono"
              />
            </div>
          )}

          {/* Voice Preferences */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-black" />
              <div>
                <div className="text-xs font-bold text-black">Auto Text-to-Speech (TTS)</div>
                <div className="text-[11px] text-zinc-600">Interviewer automatically speaks questions aloud</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => setAutoSpeak(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-zinc-50 border-t border-black">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-black transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-semibold border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition"
          >
            <Check className="w-3.5 h-3.5" /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
