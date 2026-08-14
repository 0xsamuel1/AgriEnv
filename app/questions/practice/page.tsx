"use client";

import { useState } from "react";
import { Brain, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp, SlidersHorizontal, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/frontend/components/layout/Navbar";
import PageHeader from "@/frontend/components/layout/PageHeader";

const TOPICS = [
  "Hydrology & Water Resources",
  "Irrigation Engineering",
  "Soil Mechanics & Foundation",
  "Drainage Engineering",
  "Soil & Water Conservation",
  "Environmental Impact Assessment",
  "Farm Mechanization",
  "Watershed Management",
  "Crop Processing Engineering",
  "Agricultural Structures",
];

interface PracticeQuestion {
  question: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: string;
  formulas: string[];
}

export default function PracticePage() {
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setQuestions([]);
    setSelectedAnswers({});
    setShowExplanation({});
    setSubmitted({});
    setError("");

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic, difficulty, count }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error([data.error, data.action].filter(Boolean).join(" ") || "Questions could not be generated.");
      }
      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("No questions were returned. Please try again.");
      }
      setQuestions(data.questions);
      toast.success("Practice set ready", {
        description: `${data.questions.length} ${difficulty} ${data.questions.length === 1 ? "question" : "questions"} generated for ${selectedTopic}.`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Questions could not be generated.";
      setError(message);
      toast.error("Couldn’t generate questions", { description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = (qIndex: number) => {
    setSubmitted((prev) => ({ ...prev, [qIndex]: true }));
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-container-narrow">
        <PageHeader eyebrow="Focused revision" title="AI practice mode" description="Choose a topic and difficulty, then work through a fresh set of questions with explanations on demand." icon={Brain} meta="GENERATIVE PRACTICE  •  INSTANT FEEDBACK" />

        <div className="card mb-8">
          <div className="mb-5 flex items-center gap-2 border-b border-[#e2e8e2] pb-4">
            <SlidersHorizontal className="h-4 w-4 text-green-700" /><h2 className="text-sm font-bold">Configure your session</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Topic</label>
              <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="input-field text-sm">
                {TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-field text-sm">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Questions</label>
              <select value={count} onChange={(e) => setCount(+e.target.value)} className="input-field text-sm">
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </div>
          </div>
          <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full sm:w-auto">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            {loading ? "Generating..." : "Generate Questions"}
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-6 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-6 text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {questions.map((q, i) => {
            const isSubmitted = submitted[i];
            const selectedIdx = selectedAnswers[i];
            const isShowingExplanation = showExplanation[i];

            return (
              <div key={i} className="card">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="font-medium">
                    <span className="text-[var(--primary)] font-bold mr-2">Q{i + 1}.</span>
                    {q.question}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${
                    q.difficulty === "easy" ? "bg-green-100 text-green-700"
                    : q.difficulty === "medium" ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                  }`}>
                    {q.difficulty}
                  </span>
                </div>

                {q.options ? (
                  <div className="space-y-2 mb-4">
                    {q.options.map((opt, oi) => {
                      let optClass = "bg-[var(--muted)] hover:bg-[var(--border)]";
                      if (isSubmitted) {
                        if (opt === q.correctAnswer || q.correctAnswer.startsWith(opt.charAt(0))) {
                          optClass = "bg-green-100 border-green-500";
                        } else if (oi === selectedIdx) {
                          optClass = "bg-red-100 border-red-500";
                        }
                      } else if (oi === selectedIdx) {
                        optClass = "bg-green-100 border-[var(--primary)]";
                      }
                      return (
                        <button
                          key={oi}
                          onClick={() => !isSubmitted && setSelectedAnswers((p) => ({ ...p, [i]: oi }))}
                          className={`w-full text-left p-3 rounded-xl text-sm border transition-all ${optClass}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mb-4">
                    <textarea className="input-field text-sm min-h-[80px]" placeholder="Type your answer..." />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {!isSubmitted && q.options && (
                    <button
                      onClick={() => handleSubmitAnswer(i)}
                      disabled={selectedIdx === undefined}
                      className="btn-primary text-sm py-2"
                    >
                      Submit Answer
                    </button>
                  )}
                  {isSubmitted && (
                    <div className="flex items-center gap-2">
                      {selectedIdx !== undefined && (q.options![selectedIdx] === q.correctAnswer || q.correctAnswer.startsWith(q.options![selectedIdx].charAt(0))) ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Correct!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 text-sm font-semibold">
                          <XCircle className="w-4 h-4" /> Incorrect
                        </span>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => setShowExplanation((p) => ({ ...p, [i]: !p[i] }))}
                    className="text-sm text-[var(--primary)] font-semibold flex items-center gap-1 ml-auto"
                  >
                    {isShowingExplanation ? "Hide" : "Show"} Solution
                    {isShowingExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isShowingExplanation && (
                  <div className="mt-4 p-4 rounded-xl bg-[var(--muted)] text-sm">
                    <p className="font-semibold mb-2 text-[var(--primary)]">Solution:</p>
                    <p className="whitespace-pre-wrap">{q.explanation}</p>
                    {q.formulas?.length > 0 && (
                      <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                        <strong>Formulas:</strong> {q.formulas.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
