import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database, 
  Share2, 
  RotateCcw, 
  Download, 
  Sparkles,
  ArrowRight,
  Code2,
  Cpu,
  MessageSquare,
  ShieldCheck,
  FileText,
  Loader2
} from 'lucide-react';

export default function ScorecardModal({ scorecard, problem, role, level, code = '', onRestart, onClose }) {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  useEffect(() => {
    // Fire confetti for celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignored if canvas-confetti fails
    }

    // Auto-save interview to FastAPI history backend
    try {
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateRole: role,
          level,
          problem: problem?.title || 'Technical Assessment',
          scorecard,
          code
        })
      }).catch(() => {});
    } catch {
      // Silently ignore if backend offline
    }
  }, []);

  if (!scorecard) return null;

  const getVerdictColor = (verdict) => {
    if (verdict?.toLowerCase().includes('strong')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (verdict?.toLowerCase().includes('hire')) return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  };

  const downloadPdfReport = async () => {
    setIsDownloadingPdf(true);
    try {
      const response = await fetch('/api/scorecard/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateRole: role,
          level,
          problem: problem?.title || 'Technical Assessment',
          scorecard,
          code
        })
      });

      if (!response.ok) {
        throw new Error('PDF Generation endpoint returned error');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PrepPal-Interview-Scorecard-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 4000);
    } catch (err) {
      console.warn('FastAPI PDF generation unavailable, falling back to JSON download:', err);
      downloadReport();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const downloadReport = () => {
    const reportData = {
      candidateRole: role,
      level,
      problem: problem?.title,
      date: new Date().toISOString(),
      scorecard,
      code
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prepal-interview-scorecard-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Glow Header */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-white">Interview Evaluation Report</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getVerdictColor(scorecard.verdict)}`}>
                    {scorecard.verdict || 'Completed'}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  Candidate Target: <span className="text-indigo-300 font-medium">{level} {role}</span> • Problem: <span className="text-slate-200">{problem?.title}</span>
                </p>
              </div>
            </div>

            {/* Overall Score Badge */}
            <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 px-5 py-3 rounded-xl shadow-inner">
              <div className="text-right">
                <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Overall Score</div>
                <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-mono">
                  {scorecard.overallScore}<span className="text-sm text-slate-500 font-normal"> / 10</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 4 Dimension Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Technical Accuracy
                </span>
                <span className="text-sm font-bold font-mono text-indigo-300">{scorecard.technicalAccuracy}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" style={{ width: `${scorecard.technicalAccuracy}%` }} />
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" /> Code Quality
                </span>
                <span className="text-sm font-bold font-mono text-emerald-300">{scorecard.codeQuality}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${scorecard.codeQuality}%` }} />
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Problem Solving
                </span>
                <span className="text-sm font-bold font-mono text-purple-300">{scorecard.problemSolving}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full" style={{ width: `${scorecard.problemSolving}%` }} />
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Communication
                </span>
                <span className="text-sm font-bold font-mono text-amber-300">{scorecard.communication}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{ width: `${scorecard.communication}%` }} />
              </div>
            </div>
          </div>

          {/* Complexity Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Time Complexity</div>
                <div className="text-sm font-mono text-blue-300 font-semibold mt-0.5">{scorecard.timeComplexity || 'O(n) Linear'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Space Complexity</div>
                <div className="text-sm font-mono text-emerald-300 font-semibold mt-0.5">{scorecard.spaceComplexity || 'O(1) Constant'}</div>
              </div>
            </div>
          </div>

          {/* Detailed Summary */}
          {scorecard.detailedFeedback && (
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Staff Interviewer Commentary
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {scorecard.detailedFeedback}
              </p>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Demonstrated Strengths
              </h4>
              <ul className="space-y-2">
                {scorecard.keyStrengths?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> High-Impact Improvements
              </h4>
              <ul className="space-y-2">
                {scorecard.keyWeaknesses?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-8 py-5 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center gap-2.5">
            <button
              onClick={downloadPdfReport}
              disabled={isDownloadingPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...
                </>
              ) : pdfDownloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" /> PDF Downloaded!
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Download Official PDF
                </>
              )}
            </button>

            <button
              onClick={downloadReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/60 transition"
            >
              <Download className="w-3.5 h-3.5" /> JSON Export
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm transition"
            >
              Review Code
            </button>
            <button
              onClick={onRestart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4" /> Practice Another Track
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
