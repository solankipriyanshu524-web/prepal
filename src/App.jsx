import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import SetupView from './components/SetupView';
import InterviewRoom from './components/InterviewRoom';
import ScorecardModal from './components/ScorecardModal';
import SettingsModal from './components/SettingsModal';
import { generateInterviewScorecard } from './services/aiService';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('UI Error Boundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-4">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <h3 className="text-lg font-bold text-white">Something went wrong rendering the room</h3>
            <p className="text-xs text-slate-400 mt-1">{this.state.error?.message || 'Unknown error'}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState('setup'); // 'setup', 'interview'
  const [session, setSession] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [isGeneratingScorecard, setIsGeneratingScorecard] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Load config from localStorage
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('prepal_config');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignored
    }
    return {
      provider: 'demo',
      geminiKey: '',
      openAiKey: '',
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama3.2',
      autoSpeak: true
    };
  });

  const saveConfig = (newConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('prepal_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  };

  // Timer while in interview
  useEffect(() => {
    let timer = null;
    if (currentView === 'interview') {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [currentView]);

  const handleStartInterview = (sessionParams) => {
    setSession(sessionParams);
    setCurrentView('interview');
    setScorecard(null);
  };

  const currentInterviewDataRef = useRef({ messages: [], code: '' });
  const handleUpdateData = useCallback((data) => {
    currentInterviewDataRef.current = data;
  }, []);

  const handleFinishInterview = async (data) => {
    if (!session) return;
    setIsGeneratingScorecard(true);

    const actualData = (data && data.messages && data.messages.length > 0) 
      ? data 
      : currentInterviewDataRef.current;

    try {
      const problem = session.track.sampleQuestions[0];
      const result = await generateInterviewScorecard({
        provider: config.provider,
        apiKey: config.provider === 'gemini' ? config.geminiKey : config.openAiKey,
        messages: actualData.messages || [],
        currentCode: actualData.code || '',
        problem,
        role: session.track.role,
        level: session.level.label
      });

      setScorecard(result);
    } catch (err) {
      console.error('Scorecard error:', err);
    } finally {
      setIsGeneratingScorecard(false);
    }
  };

  const handleRestart = () => {
    setScorecard(null);
    setCurrentView('setup');
    setSession(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation */}
      <Navbar
        inInterview={currentView === 'interview'}
        onEndInterview={handleFinishInterview}
        onOpenSettings={() => setIsSettingsOpen(true)}
        provider={config.provider}
        elapsedSeconds={elapsedSeconds}
      />

      {/* Main Views */}
      <main className="flex-1 flex flex-col">
        {currentView === 'setup' && (
          <SetupView
            onStartInterview={handleStartInterview}
            currentConfig={config}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {currentView === 'interview' && session && (
          <ErrorBoundary>
            <InterviewRoom
              session={session}
              config={config}
              onFinishInterview={handleFinishInterview}
              onUpdateData={handleUpdateData}
              elapsedSeconds={elapsedSeconds}
            />
          </ErrorBoundary>
        )}
      </main>

      {/* Scorecard Modal */}
      {scorecard && (
        <ScorecardModal
          scorecard={scorecard}
          problem={session?.track.sampleQuestions[0]}
          role={session?.track.role}
          level={session?.level.label}
          code={currentInterviewDataRef.current?.code || ''}
          onRestart={handleRestart}
          onClose={() => setScorecard(null)}
        />
      )}

      {/* Loading Overlay while generating scorecard */}
      {isGeneratingScorecard && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-white space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shadow-2xl animate-pulse">
            <span className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold">Analyzing Your Interview...</h3>
            <p className="text-xs text-slate-400">Evaluating Time/Space Big-O, code structure, and articulation rubric</p>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          config={config}
          onSave={saveConfig}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
