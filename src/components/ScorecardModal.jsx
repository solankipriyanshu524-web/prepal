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

  const getVerdictBadge = (verdict) => {
    return 'bg-white text-black border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden text-black animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative px-8 py-6 bg-zinc-50 border-b border-black">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Trophy className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-black">Interview Evaluation Report</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getVerdictBadge(scorecard.verdict)}`}>
                    {scorecard.verdict || 'Completed'}
                  </span>
                </div>
                <p className="text-sm text-zinc-600">
                  Candidate Target: <span className="text-black font-semibold">{level} {role}</span> • Problem: <span className="text-black font-semibold">{problem?.title}</span>
                </p>
              </div>
            </div>

            {/* Overall Score Badge */}
            <div className="flex items-center gap-3 bg-white border-2 border-black px-5 py-3 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-right">
                <div className="text-[11px] text-zinc-600 font-bold uppercase tracking-wider">Overall Score</div>
                <div className="text-3xl font-extrabold text-black font-mono">
                  {scorecard.overallScore}<span className="text-sm text-zinc-500 font-normal"> / 10</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto bg-white">
          {/* 4 Dimension Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-50 border border-black rounded-xl p-4 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-black flex items-center gap-1.5 font-bold">
                  <Cpu className="w-3.5 h-3.5 text-black" /> Technical Accuracy
                </span>
                <span className="text-sm font-bold font-mono text-black">{scorecard.technicalAccuracy}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden border border-black/20">
                <div className="h-full bg-black rounded-full" style={{ width: `${scorecard.technicalAccuracy}%` }} />
              </div>
            </div>

            <div className="bg-zinc-50 border border-black rounded-xl p-4 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-black flex items-center gap-1.5 font-bold">
                  <Code2 className="w-3.5 h-3.5 text-black" /> Code Quality
                </span>
                <span className="text-sm font-bold font-mono text-black">{scorecard.codeQuality}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden border border-black/20">
                <div className="h-full bg-black rounded-full" style={{ width: `${scorecard.codeQuality}%` }} />
              </div>
            </div>

            <div className="bg-zinc-50 border border-black rounded-xl p-4 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-black flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-black" /> Problem Solving
                </span>
                <span className="text-sm font-bold font-mono text-black">{scorecard.problemSolving}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden border border-black/20">
                <div className="h-full bg-black rounded-full" style={{ width: `${scorecard.problemSolving}%` }} />
              </div>
            </div>

            <div className="bg-zinc-50 border border-black rounded-xl p-4 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-black flex items-center gap-1.5 font-bold">
                  <MessageSquare className="w-3.5 h-3.5 text-black" /> Communication
                </span>
                <span className="text-sm font-bold font-mono text-black">{scorecard.communication}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden border border-black/20">
                <div className="h-full bg-black rounded-full" style={{ width: `${scorecard.communication}%` }} />
              </div>
            </div>
          </div>

          {/* Complexity Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <div className="p-2 rounded-lg bg-white text-black border border-black">
                <Clock className="w-4 h-4 text-black" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Estimated Time Complexity</div>
                <div className="text-sm font-mono text-black font-bold mt-0.5">{scorecard.timeComplexity || 'O(n) Linear'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <div className="p-2 rounded-lg bg-white text-black border border-black">
                <Database className="w-4 h-4 text-black" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Estimated Space Complexity</div>
                <div className="text-sm font-mono text-black font-bold mt-0.5">{scorecard.spaceComplexity || 'O(1) Constant'}</div>
              </div>
            </div>
          </div>

          {/* Detailed Summary */}
          {scorecard.detailedFeedback && (
            <div className="p-4 rounded-xl bg-zinc-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 text-black font-bold text-xs uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-black" /> Staff Interviewer Commentary
              </div>
              <p className="text-sm text-zinc-800 leading-relaxed">
                {scorecard.detailedFeedback}
              </p>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-black" /> Demonstrated Strengths
              </h4>
              <ul className="space-y-2">
                {scorecard.keyStrengths?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-zinc-800 bg-white p-3 rounded-lg border border-black shadow-sm">
                    <span className="text-black font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-black" /> High-Impact Improvements
              </h4>
              <ul className="space-y-2">
                {scorecard.keyWeaknesses?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-zinc-800 bg-white p-3 rounded-lg border border-black shadow-sm">
                    <span className="text-black font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-8 py-5 bg-zinc-50 border-t border-black">
          <div className="flex items-center gap-2.5">
            <button
              onClick={downloadPdfReport}
              disabled={isDownloadingPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-sm font-bold border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition disabled:opacity-50"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...
                </>
              ) : pdfDownloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> PDF Downloaded!
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Download Official PDF
                </>
              )}
            </button>

            <button
              onClick={downloadReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-100 text-black text-xs font-semibold border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition"
            >
              <Download className="w-3.5 h-3.5" /> JSON Export
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-600 hover:text-black font-semibold text-sm transition"
            >
              Review Code
            </button>
            <button
              onClick={onRestart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-sm font-bold border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition transform hover:-translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4" /> Practice Another Track
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
