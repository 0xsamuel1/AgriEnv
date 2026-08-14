"use client";

import Link from "next/link";
import { ArrowRight, Brain, FileQuestion, ScanSearch, Sparkles, Upload } from "lucide-react";
import Navbar from "@/frontend/components/layout/Navbar";
import PageHeader from "@/frontend/components/layout/PageHeader";

const paths = [
  { href: "/questions/upload", icon: Upload, eyebrow: "Start with your material", title: "Upload & analyse", description: "Paste past questions and let AgriEnv identify the topics, formulas, difficulty patterns, and likely areas of focus.", points: ["Topic distribution", "Difficulty mapping", "Hot-topic prediction"], cta: "Analyse questions", number: "01" },
  { href: "/questions/practice", icon: Brain, eyebrow: "Turn insight into recall", title: "AI practice mode", description: "Build a fresh practice set around your chosen course area and reveal clear explanations when you need them.", points: ["Difficulty control", "Instant feedback", "Step-by-step solutions"], cta: "Start practice", number: "02" },
];

export default function QuestionsHub() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-container-narrow">
        <PageHeader eyebrow="Question intelligence" title="Study the pattern, not just the paper." description="Use your past questions to uncover recurring themes, then practise exactly where it matters." icon={FileQuestion}>
          <span className="hidden h-14 w-14 place-items-center rounded-2xl bg-[#e7f3e9] text-green-700 sm:grid"><ScanSearch className="h-6 w-6" /></span>
        </PageHeader>

        <div className="grid gap-5 md:grid-cols-2">
          {paths.map((path) => {
            const Icon = path.icon;
            return (
              <Link key={path.href} href={path.href} className="card card-interactive group flex min-h-[390px] flex-col p-6 sm:p-7">
                <div className="flex items-start justify-between">
                  <span className="icon-tile"><Icon className="h-5 w-5" /></span>
                  <span className="font-mono text-xs font-bold text-[#a2aca5]">{path.number}</span>
                </div>
                <div className="mt-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-green-700">{path.eyebrow}</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#183021]">{path.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#6c7870]">{path.description}</p>
                </div>
                <div className="my-6 h-px bg-[#e3e9e3]" />
                <div className="space-y-2">
                  {path.points.map((point) => <div key={point} className="flex items-center gap-2 text-xs font-medium text-[#587060]"><Sparkles className="h-3.5 w-3.5 text-[#78a14b]" />{point}</div>)}
                </div>
                <div className="mt-auto flex items-center gap-2 pt-7 text-sm font-bold text-green-700">{path.cta}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
