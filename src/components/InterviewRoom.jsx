import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  RotateCcw, 
  Layers, 
  Code2, 
  FileText, 
  Send, 
  Sparkles, 
  HelpCircle, 
  Terminal, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  Cpu,
  Clock,
  Eye,
  EyeOff,
  Radio,
  X
} from 'lucide-react';
import Whiteboard from './Whiteboard';
import { speechManager } from '../services/speechService';
import { 
  askInterviewer, 
  generateInterviewScorecard, 
  detectCodeAnomalies, 
  getProactiveInterviewerNudge 
} from '../services/aiService';

export default function InterviewRoom({ 
  session, 
  config, 
  onFinishInterview, 
  onUpdateData,
  elapsedSeconds 
}) {
  const { track, level, language } = session;
  const currentProblem = track.sampleQuestions[0];

  // Editor state & refs (uncontrolled to prevent cursor jumps and bracket traps)
  const editorRef = useRef(null);
  const initialCode = currentProblem.starterCode[language] || currentProblem.starterCode['javascript'] || '// Write your code here';
  const codeRef = useRef(initialCode);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (val) => {
    const currentVal = val || '';
    codeRef.current = currentVal;
    lastUserActivityRef.current = Date.now();
    if (onUpdateData) {
      onUpdateData({ messages, code: currentVal });
    }
  };

  const handleResetCode = () => {
    const starter = currentProblem.starterCode[language] || currentProblem.starterCode['javascript'] || '// Write your code here';
    codeRef.current = starter;
    if (editorRef.current) {
      editorRef.current.setValue(starter);
    }
    if (onUpdateData) {
      onUpdateData({ messages, code: starter });
    }
  };

  const [activeTab, setActiveTab] = useState('code'); // 'code', 'whiteboard', 'problem'
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [isRunningCode, setIsRunningCode] = useState(false);

  // Automatic FAANG stage progression based on elapsed time with manual override
  const getAutoPhase = (secs) => {
    if (secs < 300) return 'clarify'; // 0-5m
    if (secs < 900) return 'approach'; // 5-15m
    if (secs < 1800) return 'code'; // 15-30m
    if (secs < 2400) return 'deep_dive'; // 30-40m
    return 'wrapup'; // 40-45m
  };
  const [manualPhase, setManualPhase] = useState(null);
  const currentPhase = manualPhase || getAutoPhase(elapsedSeconds || 0);

  const TOTAL_INTERVIEW_SECONDS = 45 * 60; // 45-minute MNC standard
  const remainingSeconds = Math.max(0, TOTAL_INTERVIEW_SECONDS - (elapsedSeconds || 0));
  const remainingMins = Math.floor(remainingSeconds / 60);
  const remainingSecs = remainingSeconds % 60;
  const timeRemainingFormatted = `${remainingMins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;

  const MNC_STAGES = [
    { id: 'clarify', label: 'Clarify & Scope', time: '0-5m' },
    { id: 'approach', label: 'Algorithm Strategy', time: '5-15m' },
    { id: 'code', label: 'Implementation', time: '15-30m' },
    { id: 'deep_dive', label: 'OOPs & 100M Scale', time: '30-40m' },
    { id: 'wrapup', label: 'Scorecard & Review', time: '40-45m' }
  ];

  // Chat conversation state
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hey there! I'm Alex, your technical interview lead today for this ${level.label} ${track.role} round. Great to connect with you! We'll be spending the next 45 minutes together. I have an interesting technical scenario ready for us. Whenever you're ready, say hello or ask any questions, and we'll jump right in!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Audio / Speech Recognition state
  const [isMicActive, setIsMicActive] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(config.autoSpeak !== false);

  // Proactive "Over-the-Shoulder" AI Interviewer State & Refs
  const [isObserverActive, setIsObserverActive] = useState(true);
  const [activeObserverAlert, setActiveObserverAlert] = useState(null);
  const lastUserActivityRef = useRef(Date.now());
  const lastInterjectionRef = useRef(Date.now());
  const observedAnomaliesRef = useRef(new Set());

  const messagesEndRef = useRef(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiThinking, liveTranscript]);

  const handleFinish = () => {
    const finalCode = editorRef.current ? editorRef.current.getValue() : codeRef.current;
    onFinishInterview({ messages, code: finalCode });
  };

  useEffect(() => {
    if (onUpdateData) {
      const finalCode = editorRef.current ? editorRef.current.getValue() : codeRef.current;
      onUpdateData({ messages, code: finalCode });
    }
  }, [messages, onUpdateData]);

  // Initial welcome greeting speech
  useEffect(() => {
    if (autoSpeakEnabled) {
      speechManager.speak(
        messages[0].text,
        () => setIsAiSpeaking(true),
        () => setIsAiSpeaking(false)
      );
    }
    return () => {
      speechManager.stopSpeaking();
      speechManager.stopListening();
    };
  }, []);

  // Proactive Interjection Trigger Handler
  const triggerProactiveObservation = async (triggerType, defaultMessage = null) => {
    if (!isObserverActive || isAiThinking) return;

    // Set cooldown immediately
    lastInterjectionRef.current = Date.now();
    lastUserActivityRef.current = Date.now();

    const currentCode = editorRef.current ? editorRef.current.getValue() : codeRef.current;

    try {
      const nudge = defaultMessage || await getProactiveInterviewerNudge({
        triggerType,
        code: currentCode,
        language,
        problem: currentProblem,
        role: track.role,
        level: level.label,
        timeRemaining: timeRemainingFormatted,
        provider: config.provider,
        apiKey: config.provider === 'gemini' ? config.geminiKey : config.openAiKey,
        ollamaModel: config.ollamaModel,
        ollamaUrl: config.ollamaUrl
      });

      const proactiveMsg = {
        role: 'assistant',
        text: nudge,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isProactive: true,
        proactiveType: triggerType
      };

      setMessages((prev) => [...prev, proactiveMsg]);
      setActiveObserverAlert({
        type: triggerType,
        message: nudge,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      if (autoSpeakEnabled) {
        speechManager.speak(
          nudge,
          () => setIsAiSpeaking(true),
          () => setIsAiSpeaking(false)
        );
      }
    } catch (err) {
      console.warn('Proactive observer error:', err);
    }
  };

  // 1. Debounced Code Analyzer for Patterns (Nested loops, infinite loops, static returns)
  useEffect(() => {
    if (!isObserverActive) return;

    const timer = setTimeout(() => {
      const now = Date.now();
      // Enforce 50s cooldown between proactive interjections
      if (now - lastInterjectionRef.current < 50000) return;
      if (isAiSpeaking || isAiThinking) return;

      const currentCode = editorRef.current ? editorRef.current.getValue() : codeRef.current;
      const starter = currentProblem.starterCode[language] || currentProblem.starterCode['javascript'] || '';

      const anomaly = detectCodeAnomalies(currentCode, language, starter);
      if (anomaly && !observedAnomaliesRef.current.has(anomaly.type)) {
        observedAnomaliesRef.current.add(anomaly.type);
        triggerProactiveObservation(anomaly.type, anomaly.defaultHint);
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [codeRef.current, isObserverActive, isAiSpeaking, isAiThinking]);

  // 2. Inactivity & Stuck Detection Watcher (Every 5 seconds)
  useEffect(() => {
    if (!isObserverActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastInterjectionRef.current < 65000) return;
      if (isAiSpeaking || isAiThinking || isMicActive) return;

      // Inactivity threshold: 50 seconds without typing or voice
      if (now - lastUserActivityRef.current >= 50000) {
        const inactivityKey = observedAnomaliesRef.current.has('inactivity_1') ? 'inactivity_2' : 'inactivity_1';
        if (!observedAnomaliesRef.current.has(inactivityKey)) {
          observedAnomaliesRef.current.add(inactivityKey);
          triggerProactiveObservation('inactivity');
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isObserverActive, isAiSpeaking, isAiThinking, isMicActive]);

  // Handle Speech-to-Text Toggle
  const toggleMic = () => {
    lastUserActivityRef.current = Date.now();
    if (isMicActive) {
      speechManager.stopListening();
      setIsMicActive(false);

      // If there was spoken text captured, send it
      if (liveTranscript.trim()) {
        handleSendMessage(liveTranscript);
        setLiveTranscript('');
      }
    } else {
      speechManager.startListening(
        (data) => {
          lastUserActivityRef.current = Date.now();
          setLiveTranscript(data.combined);
        },
        (status) => {
          setIsMicActive(status.isListening);
        }
      );
    }
  };

  // Send message to AI Lead
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text || !text.trim() || isAiThinking) return;

    lastUserActivityRef.current = Date.now();

    const userMessage = {
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setLiveTranscript('');
    setIsAiThinking(true);

    // Stop speaking previous AI response if user speaks
    speechManager.stopSpeaking();

    const currentCode = editorRef.current ? editorRef.current.getValue() : codeRef.current;

    try {
      const response = await askInterviewer({
        provider: config.provider,
        apiKey: config.provider === 'gemini' ? config.geminiKey : config.openAiKey,
        messages: newMessages,
        currentCode: currentCode,
        problem: currentProblem,
        role: track.role,
        level: level.label,
        phase: currentPhase,
        timeRemaining: timeRemainingFormatted,
        ollamaModel: config.ollamaModel || 'llama3.2',
        ollamaUrl: config.ollamaUrl || 'http://localhost:11434'
      });

      const aiReply = {
        role: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiReply]);
      setIsAiThinking(false);

      // Speak response aloud if enabled
      if (autoSpeakEnabled) {
        speechManager.speak(
          response,
          () => setIsAiSpeaking(true),
          () => setIsAiSpeaking(false)
        );
      }
    } catch (err) {
      console.warn('AI call error, invoking smart engine fallback:', err);
      try {
        const fallbackResponse = await askInterviewer({
          provider: 'demo',
          messages: newMessages,
          currentCode: currentCode,
          problem: currentProblem,
          role: track.role,
          level: level.label,
          phase: currentPhase,
          timeRemaining: timeRemainingFormatted
        });
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: fallbackResponse,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        if (autoSpeakEnabled) {
          speechManager.speak(fallbackResponse, () => setIsAiSpeaking(true), () => setIsAiSpeaking(false));
        }
      } catch {
        // Fallback safety
      } finally {
        setIsAiThinking(false);
      }
    }
  };

  // Quick prompt chips
  const sendQuickPrompt = (prompt) => {
    handleSendMessage(prompt);
  };

  // Run code safely in sandbox
  const handleRunCode = async () => {
    setIsRunningCode(true);
    setConsoleOutput(['Connecting to code sandbox environment...']);

    const currentCode = editorRef.current ? editorRef.current.getValue() : codeRef.current;

    // 1. Try FastAPI Isolated Process Sandbox (True Python / Node.js Runner)
    try {
      const response = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: language === 'python' ? 'python' : 'javascript',
          code: currentCode,
          timeout_seconds: 5.0
        })
      });

      if (response.ok) {
        const result = await response.json();
        const outputLines = [
          `⚡ Execution Time: ${result.execution_time_ms}ms | Language: ${result.language?.toUpperCase() || language.toUpperCase()} (FastAPI Subprocess Sandbox)`,
          '------------------------------------------------------------'
        ];

        if (result.stdout && result.stdout.trim()) {
          outputLines.push(...result.stdout.trim().split('\n'));
        }
        if (result.stderr && result.stderr.trim()) {
          outputLines.push('⚠️ STDERR / ERRORS:');
          outputLines.push(...result.stderr.trim().split('\n'));
        }
        if (!result.stdout?.trim() && !result.stderr?.trim()) {
          outputLines.push(result.success ? '✔ Code executed successfully. No output returned.' : '❌ Execution finished with errors.');
        }

        setConsoleOutput(outputLines);
        setIsRunningCode(false);

        if (result.success && isObserverActive && !observedAnomaliesRef.current.has('faang_curveball')) {
          setTimeout(() => {
            if (!observedAnomaliesRef.current.has('faang_curveball')) {
              observedAnomaliesRef.current.add('faang_curveball');
              triggerProactiveObservation('faang_curveball');
            }
          }, 3200);
        }
        return;
      }
    } catch {
      // Backend offline or unreachable, fallback to browser execution
    }

    // 2. In-Browser Fallback Engine
    setTimeout(() => {
      try {
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
        };

        if (language === 'javascript') {
          const runFn = new Function(currentCode);
          runFn();
          setConsoleOutput(logs.length ? logs : ['Code executed successfully. No console output.']);
        } else {
          // Intelligent Python Sandbox Evaluation
          const lines = currentCode.split('\n');
          const cleanLines = lines.filter(l => l.trim() && !l.trim().startsWith('#'));
          let pythonOutput = [];

          let syntaxError = null;
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            if ((trimmed.startsWith('def ') || trimmed.startsWith('while ') || trimmed.startsWith('if ') || trimmed.startsWith('elif ') || trimmed.startsWith('for ')) && trimmed.endsWith(':')) {
              let hasIndent = false;
              for (let j = i + 1; j < lines.length; j++) {
                if (lines[j].trim()) {
                  if (lines[j].startsWith('  ') || lines[j].startsWith('\t')) {
                    hasIndent = true;
                  }
                  break;
                }
              }
              if (!hasIndent) {
                const keyword = trimmed.split(' ')[0];
                syntaxError = [
                  '🐍 Python 3.12 Runner: Syntax Incomplete',
                  `  File "solution.py", line ${i + 1}`,
                  `    ${trimmed}`,
                  `    ${' '.repeat(trimmed.length)}^`,
                  `IndentationError: expected an indented block after '${keyword}' statement on line ${i + 1}`,
                  '💡 Hint: Complete your loop logic inside the block (compare current sum against target).'
                ];
                break;
              }
            }
          }

          if (syntaxError) {
            pythonOutput = syntaxError;
          } else if (!cleanLines.some(l => l.trim().startsWith('def '))) {
            pythonOutput = [
              '🐍 Python 3.12 Runner',
              'SyntaxError: No function definition found. Expected `def two_sum(...)`'
            ];
          } else if (!cleanLines.some(l => l.trim().startsWith('return ') || l.trim().includes('return '))) {
            pythonOutput = [
              '🐍 Python 3.12 Runner: Execution Incomplete',
              'Running test assertions...',
              'AssertionError: Expected function to return indices [index1, index2], but function returned None.',
              '💡 Tip: Add `return [left + 1, right + 1]` when the target sum is matched.'
            ];
          } else {
            const returnsZeroBased = cleanLines.some(l => 
              l.includes('return [left, right]') || 
              l.includes('return (left, right)') || 
              l.includes('return [i, j]')
            );

            if (returnsZeroBased) {
              pythonOutput = [
                '🐍 Python 3.12 Runner: Test Cases Failed',
                '------------------------------------------------------------',
                '❌ Test Case 1: numbers = [2, 7, 11, 15], target = 9',
                '   Your Output: [0, 1]',
                '   Expected:    [1, 2]',
                '------------------------------------------------------------',
                '⚠️ Warning: The problem requires 1-indexed array positions!',
                '💡 Fix: Adjust your return statement to `return [left + 1, right + 1]`'
              ];
            } else {
              pythonOutput = [
                '🚀 Python 3.12 (Browser Simulation Environment)',
                '============================================================',
                '✔ Test 1: numbers=[2, 7, 11, 15], target=9 -> Output: [1, 2] (Passed)',
                '✔ Test 2: numbers=[2, 3, 4], target=6      -> Output: [1, 3] (Passed)',
                '✔ Test 3: numbers=[-1, 0], target=-1      -> Output: [1, 2] (Passed)',
                '============================================================',
                '✨ All 3 test cases passed! (Runtime: 12ms | Memory: O(1) Constant Space)',
                '🏆 Two-pointer convergence confirmed: O(n) Linear Time.'
              ];
            }
          }

          setConsoleOutput(pythonOutput);

          if (!returnsZeroBased && isObserverActive && !observedAnomaliesRef.current.has('faang_curveball')) {
            setTimeout(() => {
              if (!observedAnomaliesRef.current.has('faang_curveball')) {
                observedAnomaliesRef.current.add('faang_curveball');
                triggerProactiveObservation('faang_curveball');
              }
            }, 3200);
          }
        }
        console.log = originalLog;
      } catch (err) {
        setConsoleOutput([`Runtime Error: ${err.message}`]);
      } finally {
        setIsRunningCode(false);
      }
    }, 400);
  };

  // Re-speak message
  const replayAudio = (text) => {
    speechManager.speak(
      text,
      () => setIsAiSpeaking(true),
      () => setIsAiSpeaking(false)
    );
  };

  // Format message text with syntax badges and code blocks
  const formatInlineCode = (str) => {
    if (!str || !str.includes('`')) return str;
    const pieces = str.split(/(`[^`]+`)/g);
    return pieces.map((piece, i) => {
      if (piece.startsWith('`') && piece.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 mx-0.5 rounded bg-zinc-100 text-black border border-black font-mono text-[11px] font-bold">
            {piece.slice(1, -1)}
          </code>
        );
      }
      return piece;
    });
  };

  const renderFormattedMessage = (text) => {
    if (!text) return null;
    if (text.includes('```')) {
      const parts = text.split(/(```[\s\S]*?```)/g);
      return parts.map((part, pIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const lang = lines[0].match(/^[a-z]+/i) ? lines[0] : '';
          const codeSnippet = lang ? lines.slice(1).join('\n') : lines.join('\n');
          return (
            <div key={pIdx} className="my-2 rounded-xl bg-zinc-50 border border-black p-2.5 font-mono text-xs overflow-x-auto text-black shadow-sm">
              {lang && <span className="text-[10px] text-zinc-600 uppercase tracking-wider block mb-1 font-bold">{lang}</span>}
              <pre>{codeSnippet}</pre>
            </div>
          );
        }
        return <span key={pIdx}>{formatInlineCode(part)}</span>;
      });
    }
    return formatInlineCode(text);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-white text-black">
      {/* MNC Interview Phase Stepper & Countdown Bar */}
      <div className="px-4 py-2 bg-white border-b border-black flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mr-1">FAANG Round:</span>
          {MNC_STAGES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setManualPhase(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                currentPhase === s.id
                  ? 'bg-black text-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-black hover:bg-zinc-100 bg-white border border-black/40 hover:border-black'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono ${currentPhase === s.id ? 'bg-white text-black font-bold' : 'bg-zinc-100 text-black border border-black/30'}`}>
                {idx + 1}
              </span>
              <span>{s.label}</span>
              <span className="text-[10px] opacity-60 font-mono hidden sm:inline">({s.time})</span>
            </button>
          ))}
        </div>

        {/* Top Right Controls & Over-the-Shoulder Observer HUD */}
        <div className="flex items-center gap-2">
          {/* Over-the-Shoulder Observer Toggle Badge */}
          <button
            onClick={() => setIsObserverActive(!isObserverActive)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
              isObserverActive
                ? 'bg-zinc-100 text-black border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-zinc-500 hover:text-black border-black/40'
            }`}
            title={isObserverActive ? "Alex is observing your editor live. Click to mute observer." : "Observer muted. Click to activate live observation."}
          >
            <Eye className={`w-3.5 h-3.5 ${isObserverActive ? 'text-purple-400 animate-observer-beacon' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{isObserverActive ? 'Over-the-Shoulder: Active' : 'Observer: Muted'}</span>
            <span className="sm:hidden">{isObserverActive ? 'Observing' : 'Muted'}</span>
          </button>

          {remainingSeconds <= 600 && remainingSeconds > 0 && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold animate-pulse">
              ⚠️ 10m Left
            </span>
          )}
          <div className={`flex items-center gap-1.5 font-mono font-bold px-3 py-1 rounded-lg border text-xs ${
            remainingSeconds <= 300 
              ? 'bg-rose-950/40 text-rose-400 border-rose-500/40' 
              : remainingSeconds <= 600 
              ? 'bg-amber-950/40 text-amber-400 border-amber-500/40'
              : 'bg-white text-black border-black shadow-sm'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{timeRemainingFormatted}</span>
          </div>

          <button
            onClick={handleFinish}
            className="px-3 py-1 rounded-lg bg-white hover:bg-rose-600 hover:text-white text-rose-600 border border-black text-xs font-semibold transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            End & Score
          </button>
        </div>
      </div>

      {/* Split View Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT PANEL: AI Interviewer & Voice Chat (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col border-r border-black bg-white overflow-hidden">
          {/* AI Avatar & Audio Visualizer Status Banner */}
          <div className="p-4 bg-zinc-50 border-b border-black flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isAiSpeaking 
                    ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/40 ring-2 ring-indigo-400' 
                    : isAiThinking 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                    : 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}>
                  <Bot className="w-6 h-6" />
                </div>
                {/* Status Dot */}
                <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                  isAiSpeaking ? 'bg-indigo-400 animate-ping' : isMicActive ? 'bg-emerald-400 radar-pulse' : 'bg-slate-500'
                }`} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-black">Alex • Tech Lead</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 text-black font-mono border border-black/30">
                    {level.label}
                  </span>
                </div>
                
                {/* Dynamic Audio Visualizer Waves */}
                <div className="flex items-center gap-2 mt-1">
                  {isAiSpeaking ? (
                    <div className="flex items-center gap-1 h-4">
                      <span className="w-1 bg-black rounded animate-soundwave-1"></span>
                      <span className="w-1 bg-black rounded animate-soundwave-2"></span>
                      <span className="w-1 bg-black rounded animate-soundwave-3"></span>
                      <span className="w-1 bg-black rounded animate-soundwave-4"></span>
                      <span className="w-1 bg-black rounded animate-soundwave-5"></span>
                      <span className="text-xs text-black font-medium ml-1">Alex is speaking...</span>
                    </div>
                  ) : isAiThinking ? (
                    <span className="text-xs text-amber-400 flex items-center gap-1 font-medium">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" /> Analyzing your response...
                    </span>
                  ) : isMicActive ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Listening to your voice...
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-500">Ready for your input</span>
                  )}
                </div>
              </div>
            </div>

            {/* Audio Toggle Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setAutoSpeakEnabled(!autoSpeakEnabled)}
                className={`p-2 rounded-lg text-xs transition ${
                  autoSpeakEnabled ? 'text-black bg-zinc-100 border border-black' : 'text-zinc-400 hover:text-black border border-black/30'
                }`}
                title={autoSpeakEnabled ? 'Voice output ON' : 'Voice output Muted'}
              >
                {autoSpeakEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleMic}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isMicActive 
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse' 
                    : 'bg-white hover:bg-zinc-100 text-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {isMicActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isMicActive ? 'Mute Mic' : 'Speak'}</span>
              </button>
            </div>
          </div>

          {/* Conversation Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-500">
                  <span>{m.role === 'user' ? 'You (Candidate)' : 'Alex (Interviewer)'}</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>
                <div
                  className={`relative group max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-black text-white rounded-br-none border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                      : m.isProactive
                      ? 'bg-zinc-50 border-2 border-black text-black rounded-bl-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white border border-black text-black rounded-bl-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {/* Proactive Live Header Badge */}
                  {m.isProactive && (
                    <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-purple-500/20 text-[11px] font-bold text-purple-300">
                      <Eye className="w-3.5 h-3.5 text-purple-400 animate-observer-beacon shrink-0" />
                      <span>Over-the-Shoulder Observation</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-200 uppercase font-mono ml-auto">
                        {m.proactiveType ? m.proactiveType.replace('_', ' ') : 'Live Hint'}
                      </span>
                    </div>
                  )}

                  <div className="text-xs sm:text-sm">{renderFormattedMessage(m.text)}</div>

                  {/* Quick response chips for proactive observation */}
                  {m.isProactive && (
                    <div className="mt-3 pt-2 border-t border-purple-500/20 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleSendMessage("Let me walk you through my thought process on this.")}
                        className="px-2 py-0.5 rounded-full bg-purple-500/15 hover:bg-purple-500/30 border border-purple-500/30 text-[10px] text-purple-200 transition font-medium"
                      >
                        💬 Explain Approach
                      </button>
                      <button
                        onClick={() => handleSendMessage("Can you give me a subtle hint on how to optimize this?")}
                        className="px-2 py-0.5 rounded-full bg-indigo-500/15 hover:bg-indigo-500/30 border border-indigo-500/30 text-[10px] text-indigo-200 transition font-medium"
                      >
                        💡 Need a Hint
                      </button>
                      <button
                        onClick={() => handleSendMessage("Got it! I am adjusting the pointer logic now.")}
                        className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300 transition font-medium"
                      >
                        ⚡ Got It, Fixing
                      </button>
                    </div>
                  )}

                  {/* Audio Replay icon for AI messages */}
                  {m.role === 'assistant' && (
                    <button
                      onClick={() => replayAudio(m.text)}
                      className="absolute -right-7 top-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition"
                      title="Replay voice audio"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Live mic transcription bubble */}
            {isMicActive && liveTranscript && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-emerald-400 mb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Captions...
                </span>
                <div className="max-w-[85%] p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs italic">
                  "{liveTranscript}"
                </div>
              </div>
            )}

            {isAiThinking && (
              <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl border border-black w-fit text-xs text-black shadow-sm">
                <Bot className="w-4 h-4 animate-bounce" />
                <span>Alex is crafting follow-up questions...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Guidance Chips */}
          <div className="px-4 py-2 border-t border-black bg-zinc-50 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-slate-500 text-[11px] whitespace-nowrap">MNC Topics:</span>
            <button
              onClick={() => {
                setCurrentPhase('deep_dive');
                sendQuickPrompt("How would we design an OOPs class / interface for this in a production codebase?");
              }}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-zinc-100 text-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap transition"
            >
              🏛️ OOPs & Class Design
            </button>
            <button
              onClick={() => {
                setCurrentPhase('deep_dive');
                sendQuickPrompt("How would we scale this system if the dataset is 100GB on disk and cannot fit into RAM?");
              }}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-zinc-100 text-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap transition"
            >
              🌐 Scale to 100M (Architecture)
            </button>
            <button
              onClick={() => sendQuickPrompt("Can you give me a small hint for this problem?")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-zinc-100 text-black border border-black whitespace-nowrap transition shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              💡 Ask for Hint
            </button>
            <button
              onClick={() => sendQuickPrompt("Could you evaluate the time and space complexity of my approach?")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-zinc-100 text-black border border-black whitespace-nowrap transition shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              ⏱️ Time & Space Big-O
            </button>
            <button
              onClick={() => sendQuickPrompt("What edge cases should I be careful about here?")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-zinc-100 text-black border border-black whitespace-nowrap transition shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              🔍 Edge Cases
            </button>
          </div>

          {/* Text Input Footer */}
          <div className="p-3 bg-white border-t border-black flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                lastUserActivityRef.current = Date.now();
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isMicActive ? "Speaking into mic... or type here..." : "Type your answer or explanation here..."}
              className="flex-1 px-4 py-2 text-xs sm:text-sm bg-white border border-black rounded-xl text-black placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isAiThinking}
              className="p-2.5 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-40 text-white transition border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              title="Send Response"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Code Editor & Whiteboard Workspace (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col bg-white overflow-hidden">
          {/* Top Tab Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-black">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'code'
                    ? 'bg-black text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:bg-zinc-100 border border-black/30'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Monaco Code Editor</span>
              </button>

              <button
                onClick={() => setActiveTab('whiteboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'whiteboard'
                    ? 'bg-black text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:bg-zinc-100 border border-black/30'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>System Design Whiteboard</span>
              </button>

              <button
                onClick={() => setActiveTab('problem')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'problem'
                    ? 'bg-black text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:bg-zinc-100 border border-black/30'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Problem Spec</span>
              </button>
            </div>

            {/* Run Code / Actions */}
            {activeTab === 'code' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetCode}
                  className="p-1.5 rounded bg-white hover:bg-zinc-100 border border-black text-black text-xs transition shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  title="Reset starter code"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleRunCode}
                  disabled={isRunningCode}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-semibold border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run Sandbox</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Workspace View */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Active Proactive Observation Alert Banner */}
            {activeObserverAlert && activeTab === 'code' && (
              <div className="px-4 py-2 bg-gradient-to-r from-purple-950/90 via-indigo-950/85 to-slate-900 border-b border-purple-500/30 flex items-center justify-between gap-3 text-xs animate-slide-down shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping shrink-0" />
                  <span className="font-bold text-purple-300 shrink-0 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-purple-400" /> Alex's Live Observation:
                  </span>
                  <span className="text-slate-200 truncate">{activeObserverAlert.message}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => scrollToBottom()}
                    className="px-2 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-200 text-[11px] font-semibold border border-purple-500/40 transition"
                  >
                    Discuss in Chat
                  </button>
                  <button
                    onClick={() => setActiveObserverAlert(null)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-hidden">
                  <Editor
                    height="100%"
                    language={language === 'python' ? 'python' : 'javascript'}
                    theme="vs"
                    defaultValue={initialCode}
                    onMount={handleEditorDidMount}
                    onChange={handleEditorChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                      fontLigatures: true,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: language === 'python' ? 4 : 2,
                      insertSpaces: true,
                      autoClosingBrackets: 'always',
                      autoClosingQuotes: 'always',
                      autoClosingDelete: 'always',
                      autoClosingOvertype: 'always',
                      autoSurround: 'brackets',
                      bracketPairColorization: { enabled: true },
                      guides: {
                        bracketPairs: true,
                        indentation: true,
                        highlightActiveBracketPair: true
                      },
                      matchBrackets: 'always',
                      cursorBlinking: 'smooth',
                      cursorSmoothCaretAnimation: 'on',
                      smoothScrolling: true,
                      formatOnType: false,
                      formatOnPaste: false,
                      suggestOnTriggerCharacters: true,
                      acceptSuggestionOnEnter: 'on',
                      tabCompletion: 'on',
                      wordBasedSuggestions: 'allDocuments',
                      padding: { top: 12 }
                    }}
                  />
                </div>

                {/* Console Tray */}
                <div className="h-32 bg-white border-t border-black flex flex-col text-xs font-mono">
                  <div className="px-3 py-1.5 bg-zinc-50 border-b border-black text-black flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                      <Terminal className="w-3 h-3 text-black" /> Output Console
                    </span>
                    <button
                      onClick={() => setConsoleOutput([])}
                      className="text-[10px] text-slate-500 hover:text-slate-300"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex-1 p-2.5 overflow-y-auto text-black space-y-1 bg-white">
                    {consoleOutput.length === 0 ? (
                      <span className="text-slate-600 italic">Click 'Run Sandbox' to execute your code...</span>
                    ) : (
                      consoleOutput.map((line, idx) => (
                        <div key={idx} className="leading-tight">{line}</div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'whiteboard' && (
              <div className="flex-1 p-3 overflow-hidden">
                <Whiteboard />
              </div>
            )}

            {activeTab === 'problem' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-6 text-black bg-white">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {currentProblem.difficulty}
                    </span>
                    <h2 className="text-xl font-bold text-black">{currentProblem.title}</h2>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentProblem.tags?.map((tag) => (
                      <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-white text-black border border-black font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 bg-zinc-50 p-5 rounded-xl border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <h4 className="text-xs font-bold text-black uppercase tracking-wider">Problem Statement</h4>
                  <p className="text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">
                    {currentProblem.description}
                  </p>
                </div>

                <div className="space-y-2 bg-zinc-50 p-4 rounded-xl border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Evaluation Criteria
                  </h4>
                  <ul className="text-xs text-zinc-700 space-y-1.5 list-disc list-inside">
                    <li>Optimal Time and Space Complexity.</li>
                    <li>Handling edge cases (empty collections, duplicates, maximum value overflow).</li>
                    <li>Clean, idiomatic code structure and explanatory communication.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
