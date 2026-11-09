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
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-4 bg-white">
          <div className="p-4 rounded-xl bg-white border-2 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg font-bold text-black">Something went wrong rendering the room</h3>
            <p className="text-xs text-zinc-600 mt-1">{this.state.error?.message || 'Unknown error'}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-semibold border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition"
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
    <div className="min-h-screen flex flex-col bg-white text-zinc-950 selection:bg-black selection:text-white">
      {/* Navigation */}
      <Navbar
        inInterview={currentView === 'interview'}
        onEndInterview={handleFinishInterview}
        onOpenSettings={() => setIsSettingsOpen(true)}
        provider={config.provider}
        elapsedSeconds={elapsedSeconds}
      />

      {/* Main Views */}
      <main className="flex-1 flex flex-col bg-white">
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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md text-black space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
            <span className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin"></span>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-black">Analyzing Your Interview...</h3>
            <p className="text-xs text-zinc-600">Evaluating Time/Space Big-O, code structure, and articulation rubric</p>
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
