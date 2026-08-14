"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, Loader2, Brain, SkipForward, RotateCcw, Headphones, RadioTower, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/frontend/components/layout/Navbar";
import PageHeader from "@/frontend/components/layout/PageHeader";

const TOPICS = [
  "Hydrology & Water Resources",
  "Irrigation Engineering",
  "Soil Mechanics",
  "Drainage Engineering",
  "Soil & Water Conservation",
  "Environmental Impact Assessment",
  "Farm Mechanization",
  "Watershed Management",
];

interface VoiceQuestion {
  question: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
}

export default function VoiceStudyPage() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<VoiceQuestion | null>(null);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; feedback: string; score: number } | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (muted) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }, [muted]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let result = "";
      for (let i = 0; i < event.results.length; i++) {
        result += event.results[i][0].transcript;
      }
      setTranscript(result);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const fetchQuestion = async () => {
    setLoading(true);
    setFeedback(null);
    setTranscript("");
    setError("");
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty: "medium", count: 1 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error([data.error, data.action].filter(Boolean).join(" ") || "A question could not be generated.");
      }
      const q = data.questions?.[0];
      if (!q) throw new Error("No question was returned. Please try again.");

      setCurrentQuestion(q);
      await speak(`Question: ${q.question}`);
      if (q.options) {
        for (let i = 0; i < q.options.length; i++) {
          await speak(q.options[i]);
        }
      }
      await speak("What is your answer?");
      startListening();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "A question could not be generated.";
      setError(message);
      toast.error("Voice study couldn’t start", { description: message });
      await speak("Sorry, I couldn't generate a question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitVoiceAnswer = async () => {
    stopListening();
    if (!transcript || !currentQuestion) return;

    setLoading(true);
    await speak("Let me check your answer...");

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          userAnswer: transcript,
          topic,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error([data.error, data.action].filter(Boolean).join(" ") || "Your answer could not be evaluated.");
      }
      setFeedback(data);
      setQuestionsAnswered((c) => c + 1);
      if (data.isCorrect) setTotalScore((s) => s + data.score);

      await speak(data.feedback);
      if (!data.isCorrect) {
        await speak(`The correct answer is: ${data.correctAnswer}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Your answer could not be evaluated.";
      setError(message);
      toast.error("Couldn’t evaluate your answer", { description: message });
      await speak("Sorry, I couldn't evaluate your answer.");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setIsActive(true);
    setQuestionsAnswered(0);
    setTotalScore(0);
    fetchQuestion();
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  if (!isActive) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="page-container-narrow">
          <PageHeader eyebrow="Hands-free learning" title="Voice study" description="Listen to questions, speak your answer naturally, and receive instant AI-guided feedback without breaking your flow." icon={Headphones} meta="LISTEN  •  RESPOND  •  IMPROVE">
            <span className="hidden h-14 w-14 place-items-center rounded-2xl bg-[#e6f2e5] text-green-700 sm:grid"><RadioTower className="h-6 w-6" /></span>
          </PageHeader>

          <div className="grid gap-5 md:grid-cols-[1.2fr_.8fr]">
            <section className="card">
              <span className="page-kicker">Session setup</span>
              <h2 className="text-xl font-bold tracking-tight">What should we revise?</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Choose a course area. AgriEnv will read a question aloud and start listening when it is your turn.</p>
              <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-[#66756b]">Study topic</label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)} className="input-field mt-2">
                {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={handleStart} className="btn-primary mt-4 w-full"><Mic className="h-5 w-5" />Start voice study</button>
            </section>

            <aside className="rounded-[1.25rem] bg-[#173d28] p-6 text-white">
              <ShieldCheck className="h-6 w-6 text-[#c6df7e]" />
              <h3 className="mt-5 font-bold">Before you begin</h3>
              <div className="mt-4 space-y-3 text-xs leading-5 text-white/70">
                <p>Allow microphone access when your browser asks.</p>
                <p>Find a reasonably quiet space for clearer recognition.</p>
                <p>Chrome offers the most consistent browser support.</p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-container-narrow max-w-3xl">
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#dce5dd] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="page-kicker mb-1"><RadioTower className="h-3.5 w-3.5" />Live session</p><h1 className="text-xl font-bold">Voice study</h1></div>
          <div className="flex items-center gap-3">
            <button onClick={() => setMuted(!muted)} className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--muted)] text-[#4d6254]" aria-label={muted ? "Unmute voice" : "Mute voice"}>
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <span className="whitespace-nowrap rounded-xl bg-[#edf4eb] px-3 py-2 font-mono text-xs font-bold text-green-800">
              {questionsAnswered} Qs · {totalScore} pts
            </span>
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-6 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-6 text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="card mb-6">
          {currentQuestion && (
            <div className="mb-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#7b887f]">Current question</p>
              <p className="text-base font-semibold leading-7">{currentQuestion.question}</p>
              {currentQuestion.options && (
                <div className="mt-3 space-y-1">
                  {currentQuestion.options.map((opt, i) => (
                    <p key={i} className="rounded-lg bg-[#f2f5f1] p-2.5 text-sm text-[#637168]">{opt}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {isSpeaking && (
            <div className="flex items-center gap-2 text-[var(--primary)] mb-4">
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-medium">Speaking...</span>
            </div>
          )}

          <div className={`p-4 rounded-xl border-2 transition-all ${
            isListening ? "border-[var(--primary)] bg-green-50" : "border-[var(--border)] bg-[var(--muted)]"
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {isListening ? (
                <Mic className="w-6 h-6 text-[var(--primary)] animate-pulse" />
              ) : (
                <MicOff className="w-6 h-6 text-[#8a978f]" />
              )}
              <span className="text-sm font-medium">
                {isListening ? "Listening..." : "Microphone off"}
              </span>
            </div>
            {transcript && (
              <p className="text-sm mt-2 p-2 rounded-lg bg-[var(--card)]">
                &ldquo;{transcript}&rdquo;
              </p>
            )}
          </div>
        </div>

        {feedback && (
          <div className={`card mb-6 border-2 ${feedback.isCorrect ? "border-green-500" : "border-red-500"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-[var(--primary)]" />
              <span className="font-bold text-sm">{feedback.isCorrect ? "Correct!" : "Not quite..."}</span>
              <span className="ml-auto font-mono text-sm">{feedback.score}/100</span>
            </div>
            <p className="text-sm">{feedback.feedback}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {isListening ? (
            <button onClick={submitVoiceAnswer} disabled={!transcript} className="btn-primary flex-1 flex items-center justify-center gap-2">
              Submit Answer
            </button>
          ) : !loading ? (
            <>
              <button onClick={startListening} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Mic className="w-5 h-5" /> Speak Answer
              </button>
              <button onClick={fetchQuestion} className="btn-secondary">
                <SkipForward className="w-5 h-5" /> Next
              </button>
            </>
          ) : (
            <button disabled className="btn-primary flex-1 flex items-center justify-center gap-2 opacity-70">
              <Loader2 className="w-5 h-5 animate-spin" /> Processing...
            </button>
          )}
          <button onClick={() => setIsActive(false)} className="btn-secondary" aria-label="End session">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
