'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SOSButton from '../components/SOSButton';
import TranscriptDisplay from '../components/TranscriptDisplay';
import RiskGauge from '../components/RiskGauge';
import GroundingScript from '../components/GroundingScript';
import SafetyPlan from '../components/SafetyPlan';
import CaregiverPanel from '../components/CaregiverPanel';

/**
 * Backend response interface — matches the FastAPI OrchestrateResponse schema.
 * Uses snake_case to match the JSON returned by the Python backend.
 */
interface BackendResponse {
  intent_detection: {
    user_state: string;
    emotional_tone: string;
    urgency_level: string;
  };
  relapse_risk: {
    level: string;
    percentage: number;
    contributing_factors: string[];
  };
  grounding_script: {
    title: string;
    duration_minutes: number;
    steps: string[];
  };
  caregiver_advice: {
    summary: string;
    dos: string[];
    donts: string[];
    conversation_starters: string[];
  };
  safety_plan: {
    plan_title: string;
    immediate_actions: Array<{
      action: string;
      priority: string;
      details: string;
    }>;
    coping_strategies: string[];
    warning_signs: string[];
  };
  family_notification: {
    notify_family: boolean;
    reason: string;
    suggested_message: string;
  };
  crisis_log_id: string | null;
  timestamp: string;
}

/** Default test user ID (pre-seeded in schema.sql) */
const TEST_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

/** Backend API base URL */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<BackendResponse | null>(null);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef('');

  // Keep transcript ref in sync for use in onend callback
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  /**
   * Submit the transcript to the FastAPI backend.
   * Makes a REAL API call — no mock data.
   */
  const handleSubmit = useCallback(async (inputText: string) => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setResponse(null);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice_transcript: inputText,
          user_id: TEST_USER_ID,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (${res.status}). Please try again.`);
      }

      const data: BackendResponse = await res.json();
      setResponse(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect to the server.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /** Initialize Web Speech API on mount */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI = (window as unknown as { SpeechRecognition: typeof SpeechRecognition }).SpeechRecognition || 
                                 (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputMode('text');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please enable it in your browser settings or use text input.');
      } else {
        setError('Microphone error. Switching to text input.');
      }
      setInputMode('text');
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-submit if we have transcript text
      const currentText = transcriptRef.current;
      if (currentText.trim().length > 0) {
        handleSubmit(currentText);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [handleSubmit]);

  /** Toggle voice listening on/off */
  const toggleListening = () => {
    if (isProcessing) return;

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setResponse(null);
      setError('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e: unknown) {
        console.error('Failed to start speech recognition:', e);
        setInputMode('text');
      }
    }
  };

  /** Handle text form submission */
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      setTranscript(textInput);
      handleSubmit(textInput);
    }
  };

  /** Reset to start a new session */
  const resetSession = () => {
    setResponse(null);
    setTranscript('');
    setTextInput('');
    setError('');
  };

  return (
    <main
      className="flex min-h-[100dvh] flex-col items-center justify-center p-4 md:p-8 overflow-hidden bg-gradient-to-b from-stone-900 to-amber-950/20"
      role="main"
      aria-label="AnchorAI SOS Recovery Interface"
    >
      {/* Header */}
      <header className="z-10 max-w-6xl w-full items-center justify-center flex flex-col mb-8 text-center mt-[-5vh]">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight drop-shadow-md">
          <span className="text-white">Anchor</span>
          <span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">AI</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-stone-300 font-medium mb-6 w-full max-w-4xl leading-relaxed" role="doc-subtitle">
          Your zero-judgment, real-time recovery companion. <br className="hidden md:block" />
          Tap the SOS button to speak, and our AI will instantly generate a personalized safety plan and grounding exercise to help you through this moment.
        </p>

        <div className="mt-2 p-5 rounded-2xl bg-gradient-to-r from-amber-900/40 to-rose-900/40 border border-amber-500/30 w-full max-w-3xl shadow-xl shadow-amber-900/20 backdrop-blur-sm">
          <p className="text-amber-50 text-lg md:text-xl italic font-medium flex items-center justify-center gap-3">
            <span className="text-2xl" aria-hidden="true">🌟</span>
            <span>&quot;You are stronger than whatever is trying to pull you down today. Take a deep breath, we are here for you.&quot;</span>
            <span className="text-2xl" aria-hidden="true">💛</span>
          </p>
        </div>
      </header>

      {/* SOS Interface — shown when no response yet */}
      {!response ? (
        <section
          className="flex flex-col items-center justify-center w-full max-w-3xl animate-fade-in"
          aria-label="SOS crisis intervention"
        >
          {inputMode === 'voice' ? (
            <>
              <SOSButton
                isListening={isListening}
                isProcessing={isProcessing}
                onClick={toggleListening}
              />
              <div className="mt-8 w-full max-w-2xl">
                <TranscriptDisplay transcript={transcript} isListening={isListening} />
              </div>
              <button
                onClick={() => setInputMode('text')}
                className="mt-6 text-sm text-stone-400 hover:text-white transition-colors underline underline-offset-4 decoration-stone-600 hover:decoration-stone-400"
                aria-label="Switch to text input mode"
              >
                Prefer to type? Switch to text input
              </button>
            </>
          ) : (
            <form onSubmit={handleTextSubmit} className="w-full flex flex-col items-center gap-4">
              <textarea
                id="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="How are you feeling right now? Describe what you're experiencing..."
                className="w-full h-32 glass-panel p-5 text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-stone-400 resize-none"
                aria-label="Describe your current feelings and state"
                maxLength={5000}
              />
              <button
                type="submit"
                disabled={isProcessing || !textInput.trim()}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-lg hover:from-amber-400 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-amber-500/25"
                aria-label="Submit your message for AI analysis"
                id="submit-text-btn"
              >
                {isProcessing ? 'Analyzing...' : 'Get Help Now'}
              </button>
              <button
                type="button"
                onClick={() => setInputMode('voice')}
                className="mt-2 text-sm text-stone-400 hover:text-white transition-colors underline underline-offset-4 decoration-stone-600 hover:decoration-stone-400"
                aria-label="Switch to voice input mode"
              >
                Switch to voice input
              </button>
            </form>
          )}

          {error && (
            <div
              className="mt-6 p-4 rounded-lg bg-red-900/30 border border-red-500/50 text-red-200"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}
        </section>
      ) : (
        /* Dashboard — shown after Gemini response */
        <section
          className="w-full max-w-6xl animate-slide-up"
          aria-label="Crisis analysis results"
        >
          {/* Dashboard Header */}
          <div className="col-span-full mb-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Crisis Analysis Complete</h2>
            <p className="text-slate-400 mb-4">
              Powered by Gemini AI — generated at {new Date(response.timestamp).toLocaleTimeString()}
            </p>
            <button
              onClick={resetSession}
              className="px-6 py-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors border border-slate-600"
              aria-label="Start a new SOS session"
              id="new-session-btn"
            >
              Start New Session
            </button>
          </div>

          {/* Intent Detection Banner */}
          <div className="glass-panel p-4 mb-6 flex flex-wrap items-center gap-4" aria-label="Detected intent">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">State:</span>
              <span className="text-white font-medium">{response.intent_detection.user_state}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Tone:</span>
              <span className="text-white font-medium">{response.intent_detection.emotional_tone}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Urgency:</span>
              <span className={`font-bold uppercase text-sm ${
                response.intent_detection.urgency_level === 'critical' || response.intent_detection.urgency_level === 'high'
                  ? 'text-red-400' : response.intent_detection.urgency_level === 'moderate'
                  ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {response.intent_detection.urgency_level}
              </span>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Risk Gauge */}
            <RiskGauge
              level={response.relapse_risk.level}
              percentage={response.relapse_risk.percentage}
              contributingFactors={response.relapse_risk.contributing_factors}
            />

            {/* Grounding Script */}
            <GroundingScript
              title="You don't have to go through this alone. We are here to help."
              subtitle="&quot;Speak your thoughts, we are listening&quot;"
              durationMinutes={response.grounding_script.duration_minutes}
              steps={response.grounding_script.steps}
            />

            {/* Safety Plan — map immediate_actions objects to display strings */}
            <SafetyPlan
              planTitle={response.safety_plan.plan_title}
              immediateActions={response.safety_plan.immediate_actions.map(
                (a) => `${a.action}${a.details ? ` — ${a.details}` : ''}`
              )}
              copingStrategies={response.safety_plan.coping_strategies}
              warningSigns={response.safety_plan.warning_signs}
            />

            {/* Caregiver Panel — full width */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <CaregiverPanel
                summary={response.caregiver_advice.summary}
                dos={response.caregiver_advice.dos}
                donts={response.caregiver_advice.donts}
                conversationStarters={response.caregiver_advice.conversation_starters}
                notifyFamily={response.family_notification.notify_family}
                notifyReason={response.family_notification.reason}
              />
            </div>
          </div>
        </section>
      )}

      {/* Footer Link */}
      <nav className="mt-auto pt-16" aria-label="Secondary navigation">
        <Link
          href="/dashboard"
          className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4 decoration-emerald-500/30 hover:decoration-emerald-400 transition-all"
          aria-label="View crisis history dashboard"
        >
          View Crisis History &amp; Dashboard →
        </Link>
      </nav>
    </main>
  );
}
