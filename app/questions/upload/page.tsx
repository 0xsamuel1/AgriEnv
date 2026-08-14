"use client";

import { useState } from "react";
import { Upload, Loader2, BarChart3, BookOpen, AlertTriangle, ScanSearch } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/frontend/components/layout/Navbar";
import PageHeader from "@/frontend/components/layout/PageHeader";

interface AnalyzedQuestion {
  question: string;
  topic: string;
  difficulty: string;
  subtopic: string;
  keyFormulas: string[];
  conceptsTested: string[];
}

export default function UploadPage() {
  const [questionsText, setQuestionsText] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalyzedQuestion[] | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!questionsText.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: questionsText, courseCode, year }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.questions || []);
      toast.success("Paper analysis complete", {
        description: `${data.questions?.length || 0} questions were organised by topic and difficulty.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed. Check your API key.";
      setError(message);
      toast.error("Couldn’t analyse this paper", { description: message });
    } finally {
      setLoading(false);
    }
  };

  const topicCounts = results
    ? results.reduce((acc: Record<string, number>, q) => {
        acc[q.topic] = (acc[q.topic] || 0) + 1;
        return acc;
      }, {})
    : {};
  const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-container-narrow">
        <PageHeader eyebrow="Question intelligence" title="Upload & analyse" description="Add a past paper and get a structured view of the topics, difficulty, formulas, and patterns hidden inside it." icon={ScanSearch} meta="PASTE QUESTION TEXT  •  AI-ASSISTED ANALYSIS" />

        <div className="card mb-8">
          <div className="mb-6 flex items-start gap-3 border-b border-[#e2e8e2] pb-5">
            <span className="icon-tile shrink-0"><Upload className="h-5 w-5" /></span>
            <div><h2 className="font-bold text-[#183021]">Question source</h2><p className="mt-1 text-xs leading-5 text-[#78857c]">Add context for a more useful analysis.</p></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Course Code</label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="input-field"
                placeholder="e.g., AGE 501"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="input-field"
                placeholder="e.g., 2024/2025"
              />
            </div>
          </div>

          <label className="block text-sm font-medium mb-1">Paste Questions</label>
          <textarea
            value={questionsText}
            onChange={(e) => setQuestionsText(e.target.value)}
            className="input-field min-h-[200px] font-mono text-sm"
            placeholder="Paste your past questions here...&#10;&#10;1. Define the Rational Method and state its assumptions...&#10;2. A rectangular channel 3m wide carries water at a depth of 1.2m..."
          />

          {error && (
            <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-red-50 text-[var(--destructive)] text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !questionsText.trim()}
            className="btn-primary mt-4 w-full sm:w-auto"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {loading ? "Analyzing..." : "Analyze Questions"}
          </button>
        </div>

        {results && (
          <>
            <div className="card mb-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
                <h2 className="text-lg font-bold">Topic Distribution</h2>
              </div>
              <div className="space-y-3">
                {sortedTopics.map(([topic, count]) => {
                  const pct = (count / results.length) * 100;
                  return (
                    <div key={topic}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{topic}</span>
                        <span className="text-[var(--muted-foreground)]">{count} questions ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2.5 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {sortedTopics.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-[var(--primary-light)] text-sm">
                  <strong>Hot Topic Prediction:</strong> Based on frequency, focus on{" "}
                  <strong>{sortedTopics[0][0]}</strong>
                  {sortedTopics.length > 1 && <> and <strong>{sortedTopics[1][0]}</strong></>}.
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--primary)]" />
                <h2 className="text-lg font-bold">Analyzed Questions ({results.length})</h2>
              </div>
              {results.map((q, i) => (
                <div key={i} className="card">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-sm font-medium flex-1">{q.question}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${
                        q.difficulty === "easy"
                          ? "bg-green-100 text-green-700"
                          : q.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-green-100 text-[var(--primary)] px-2 py-0.5 rounded-full">
                      {q.topic}
                    </span>
                    <span className="text-xs bg-[var(--muted)] text-[var(--muted-foreground)] px-2 py-0.5 rounded-full">
                      {q.subtopic}
                    </span>
                  </div>
                  {q.keyFormulas?.length > 0 && (
                    <div className="mt-2 text-xs text-[var(--muted-foreground)]">
                      <span className="font-semibold">Formulas:</span> {q.keyFormulas.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
