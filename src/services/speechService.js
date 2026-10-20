export function normalizeTechSpeech(text) {
  if (!text) return text;
  return text
    // Big-O and complexity
    .replace(/\bo\.o\b/gi, 'O(1)')
    .replace(/\bo\s+o\b/gi, 'O(n)')
    .replace(/\bo of n square\b/gi, 'O(n²)')
    .replace(/\bo of n\b/gi, 'O(n)')
    .replace(/\bo of one\b/gi, 'O(1)')
    .replace(/\bo of log n\b/gi, 'O(log n)')
    .replace(/\bo\s*\(\s*1\s*\)/gi, 'O(1)')
    .replace(/\bo\s*\(\s*n\s*\)/gi, 'O(n)')
    .replace(/\bbig o\b/gi, 'Big-O')
    // Pointers & algorithms
    .replace(/\btwo point shares\b/gi, 'two pointers')
    .replace(/\btwo point share\b/gi, 'two pointers')
    .replace(/\bpoint shares\b/gi, 'pointers')
    .replace(/\bpoint share\b/gi, 'pointer')
    .replace(/\bto pointer\b/gi, 'two pointer')
    .replace(/\btoo pointer\b/gi, 'two pointer')
    .replace(/\bto pointers\b/gi, 'two pointers')
    .replace(/\btoo pointers\b/gi, 'two pointers')
    // Array & math terms
    .replace(/\bbe at assam\b/gi, 'be at a sum')
    .replace(/\bat assam\b/gi, 'a sum')
    .replace(/\bassam\b/gi, 'a sum')
    .replace(/\bhash map\b/gi, 'hashmap')
    .replace(/\bbinary search\b/gi, 'binary search')
    .replace(/\bindices\b/gi, 'indices')
    .replace(/\bindex is\b/gi, 'indices')
    .replace(/\bleft pointer\b/gi, 'left pointer')
    .replace(/\bright pointer\b/gi, 'right pointer');
}

class SpeechManager {
  constructor() {
    this.recognition = null;
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isListening = false;
    this.isSpeaking = false;
    this.activeUtterance = null;
    this.onTranscriptUpdate = null;
    this.onStatusChange = null;
    this.accumulatedFinal = '';

    this.initRecognition();
  }

  initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStatusChange) this.onStatusChange({ isListening: true });
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          this.accumulatedFinal += (this.accumulatedFinal ? ' ' : '') + transcript.trim();
        } else {
          interimTranscript += transcript;
        }
      }

      const cleanedFinal = normalizeTechSpeech(this.accumulatedFinal);
      const cleanedInterim = normalizeTechSpeech(interimTranscript);
      const combined = (cleanedFinal + (cleanedInterim ? ' ' + cleanedInterim : '')).trim();

      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate({
          final: cleanedFinal,
          interim: cleanedInterim,
          combined: combined
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        this.isListening = false;
        if (this.onStatusChange) this.onStatusChange({ isListening: false, error: 'Mic access denied' });
      }
    };

    this.recognition.onend = () => {
      // If still set to listening, restart continuous listening
      if (this.isListening) {
        try {
          this.recognition.start();
        } catch {
          this.isListening = false;
          if (this.onStatusChange) this.onStatusChange({ isListening: false });
        }
      } else {
        if (this.onStatusChange) this.onStatusChange({ isListening: false });
      }
    };
  }

  startListening(onTranscript, onStatus) {
    this.onTranscriptUpdate = onTranscript;
    this.onStatusChange = onStatus;
    this.accumulatedFinal = '';

    if (!this.recognition) {
      if (onStatus) onStatus({ isListening: false, error: 'Speech recognition not supported in browser' });
      return;
    }

    try {
      this.isListening = true;
      this.recognition.start();
    } catch {
      // Already running or starting
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    if (this.onStatusChange) this.onStatusChange({ isListening: false });
  }

  speak(text, onStart, onEnd) {
    if (!this.synthesis) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel current speech if any
    this.stopSpeaking();

    // Clean text of markdown backticks or symbols for smoother speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'refer to code snippet')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = this.synthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.activeUtterance = utterance;
    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.isSpeaking = false;
  }
}

export const speechManager = new SpeechManager();
