"use client";

import { useState } from "react";
import { Lightbulb, Loader2, MapPin, Star, Wrench, Banknote, Target, FlaskConical, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/frontend/components/layout/Navbar";
import PageHeader from "@/frontend/components/layout/PageHeader";

const INTEREST_OPTIONS = [
  "Irrigation Systems",
  "Soil Conservation",
  "Environmental Engineering",
  "Farm Mechanization",
  "Water Resources",
  "Crop Processing",
  "Renewable Energy in Agriculture",
  "Precision Agriculture",
  "Waste Management",
  "Climate-Smart Agriculture",
  "Food Security",
  "Aquaculture Engineering",
];

const REGIONS = [
  "Any Region",
  "South-West (Lagos, Ogun, Oyo, etc.)",
  "South-East (Enugu, Anambra, Imo, etc.)",
  "South-South (Rivers, Edo, Delta, etc.)",
  "North-Central (Kwara, Niger, Benue, etc.)",
  "North-West (Kano, Kaduna, Kebbi, etc.)",
  "North-East (Borno, Adamawa, Bauchi, etc.)",
];

interface ProjectIdea {
  title: string;
  problemStatement: string;
  region: string;
  category: string;
  methodology: string[];
  expectedOutcomes: string[];
  feasibilityScore: number;
  innovationScore: number;
  impact: string;
  suggestedTools: string[];
  estimatedCost: string;
}

export default function ProjectIdeasPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [region, setRegion] = useState("Any Region");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectIdea[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState("");

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleGenerate = async () => {
    if (selectedInterests.length === 0) return;
    setLoading(true);
    setProjects([]);
    setError("");

    try {
      const res = await fetch("/api/ai/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: selectedInterests, region, count: 5 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error([data.error, data.action].filter(Boolean).join(" ") || "Project ideas could not be generated.");
      }
      if (!Array.isArray(data.projects) || data.projects.length === 0) {
        throw new Error("No project ideas were returned. Please try again.");
      }
      setProjects(data.projects);
      toast.success("Project directions ready", {
        description: `${data.projects.length} locally relevant ideas were generated for you.`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Project ideas could not be generated.";
      setError(message);
      toast.error("Couldn’t generate project ideas", { description: message });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 5) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-container-narrow">
        <PageHeader eyebrow="Final-year project lab" title="Build an idea worth pursuing." description="Generate feasible project directions around real Nigerian agricultural challenges, your interests, and the region you want to serve." icon={Lightbulb} meta="CONTEXTUAL IDEAS  •  METHODS  •  COST & IMPACT">
          <span className="hidden h-14 w-14 place-items-center rounded-2xl bg-[#eef1dc] text-[#747e2a] sm:grid"><Sparkles className="h-6 w-6" /></span>
        </PageHeader>

        <div className="card mb-8">
          <div className="mb-5 border-b border-[#e2e8e2] pb-4">
            <h2 className="font-bold">Shape your brief</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">Select one or more fields, then choose where the solution should be relevant.</p>
          </div>
          <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-[#6a786f]">Your interests</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedInterests.includes(interest)
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[#e2e9e1]"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6a786f] mb-2">Preferred region</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="input-field text-sm">
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || selectedInterests.length === 0}
            className="btn-primary w-full sm:w-auto"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lightbulb className="w-5 h-5" />}
            {loading ? "Generating Ideas..." : "Generate Project Ideas"}
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-6 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-6 text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {projects.map((project, i) => (
            <div key={i} className="card cursor-pointer hover:border-[#b8cbbd]" onClick={() => setExpanded(expanded === i ? null : i)}>
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e9efda] font-mono font-bold text-[#66732a]">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{project.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="flex items-center gap-1 text-xs bg-[var(--muted)] px-2 py-0.5 rounded-full">
                      <MapPin className="w-3 h-3" /> {project.region}
                    </span>
                    <span className="text-xs bg-green-100 text-[var(--primary)] px-2 py-0.5 rounded-full">
                      {project.category}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">{project.problemStatement}</p>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span className="text-xs">Feasibility:</span>
                      <span className={`text-sm font-bold ${getScoreColor(project.feasibilityScore)}`}>
                        {project.feasibilityScore}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FlaskConical className="w-4 h-4" />
                      <span className="text-xs">Innovation:</span>
                      <span className={`text-sm font-bold ${getScoreColor(project.innovationScore)}`}>
                        {project.innovationScore}/10
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {expanded === i && (
                <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-4">
                  <div>
                    <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-[var(--primary)]" /> Methodology
                    </h4>
                    <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                      {project.methodology.map((m, mi) => (
                        <li key={mi} className="flex items-start gap-2">
                          <span className="text-[var(--primary)] mt-1">&#x2022;</span> {m}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold mb-2">Expected Outcomes</h4>
                    <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                      {project.expectedOutcomes.map((o, oi) => (
                        <li key={oi} className="flex items-start gap-2">
                          <span className="text-[var(--success)] mt-1">&#x2713;</span> {o}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[var(--muted)]">
                      <p className="text-xs text-[var(--muted-foreground)] mb-1 flex items-center gap-1">
                        <Wrench className="w-3 h-3" /> Tools Needed
                      </p>
                      <p className="text-sm">{project.suggestedTools.join(", ")}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--muted)]">
                      <p className="text-xs text-[var(--muted-foreground)] mb-1 flex items-center gap-1">
                        <Banknote className="w-3 h-3" /> Estimated Cost
                      </p>
                      <p className="text-sm font-mono">{project.estimatedCost}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                    <p className="text-xs text-[var(--primary)] font-semibold mb-1">Impact</p>
                    <p className="text-sm">{project.impact}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
