"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenCheck, BrainCircuit, Check, Droplets, FileQuestion, FlaskConical, Gauge, Layers3, Lightbulb, Mic, Mountain, Pipette, Play, Sprout, Swords, Trophy, Users, Waves } from "lucide-react";
import Navbar from "@/frontend/components/layout/Navbar";
import Brand from "@/frontend/components/layout/Brand";

const features = [
  { href: "/simulate", icon: FlaskConical, title: "Engineering simulations", description: "Explore runoff, irrigation, erosion, and drainage through responsive visual models.", eyebrow: "Model & understand", className: "lg:col-span-2", preview: true },
  { href: "/questions", icon: FileQuestion, title: "Past question intelligence", description: "Turn old exam papers into topic insights and focused practice.", eyebrow: "Analyse smarter" },
  { href: "/showdown", icon: Swords, title: "Group showdown", description: "Create a room and challenge your coursemates in a live quiz battle.", eyebrow: "Learn together" },
  { href: "/voice", icon: Mic, title: "Voice study", description: "Answer aloud and get clear, AI-guided feedback hands-free.", eyebrow: "Study anywhere" },
  { href: "/projects", icon: Lightbulb, title: "Project idea lab", description: "Discover viable project ideas grounded in Nigerian agricultural challenges.", eyebrow: "Build for impact", className: "lg:col-span-2" },
];

const simulationItems = [
  { icon: Droplets, label: "Runoff", value: "Q = CiA / 360" },
  { icon: Pipette, label: "Irrigation", value: "CU & DU" },
  { icon: Mountain, label: "Erosion", value: "USLE" },
  { icon: Waves, label: "Drainage", value: "Manning" },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />

      <main>
        <section className="relative bg-[#123d25] text-white">
          <div className="absolute inset-0 lg:left-[48%]">
            <Image src="/images/agrienv-hero.png" alt="Modern irrigated agricultural research fields at sunrise" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover object-center" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#123d25_0%,rgba(18,61,37,.97)_35%,rgba(18,61,37,.72)_61%,rgba(18,61,37,.15)_100%)] lg:block" />
          <div className="absolute inset-0 bg-[#123d25]/70 lg:hidden" />
          <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:44px_44px]" />

          <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
            <div className="max-w-3xl animate-fade-up">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white/80 backdrop-blur-md">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#b8d767] text-[#123d25]"><Sprout className="h-3 w-3" /></span>
                Built for Agricultural &amp; Environmental Engineers
              </div>
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.03] tracking-[-0.055em] sm:text-6xl lg:text-[4.5rem]">
                Learn the science.<br />Engineer the <span className="text-[#c5df7d]">future.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                A modern study platform that turns complex agricultural engineering concepts into visual simulations, focused practice, and collaborative learning.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-[#16452b] transition-all hover:bg-[#f2f8e8] hover:shadow-xl">
                  Start learning free <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#platform" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20">
                  <Play className="h-4 w-4 fill-current" /> Explore the platform
                </a>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-white/60">
                {["No credit card", "Purpose-built for AgEng", "Works on every device"].map((item) => (
                  <span key={item} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#c5df7d]" />{item}</span>
                ))}
              </div>
            </div>

            <div className="relative hidden min-h-[520px] lg:block">
              <div className="absolute bottom-5 right-0 w-[330px] rounded-3xl border border-white/20 bg-[#f8faf6]/95 p-4 text-[#173221] shadow-2xl backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-green-700">Live workspace</p>
                    <p className="mt-1 text-sm font-bold">Runoff model</p>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e3f1e2] text-green-700"><Gauge className="h-5 w-5" /></span>
                </div>
                <div className="relative h-24 overflow-hidden rounded-2xl bg-[#dce9d8]">
                  <svg viewBox="0 0 300 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
                    <path d="M0 86 C55 72, 85 82, 125 52 S210 28, 300 14" fill="none" stroke="#23794a" strokeWidth="3" />
                    <path d="M0 86 C55 72, 85 82, 125 52 S210 28, 300 14 L300 100 L0 100Z" fill="url(#chartFill)" />
                    <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#54a46d" stopOpacity=".35" /><stop offset="1" stopColor="#54a46d" stopOpacity=".02" /></linearGradient></defs>
                  </svg>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-[#eff4ed] p-3"><p className="text-[10px] text-[#748178]">Rainfall intensity</p><p className="mt-1 font-mono text-sm font-bold">50 mm/hr</p></div>
                  <div className="rounded-xl bg-[#173d28] p-3 text-white"><p className="text-[10px] text-white/60">Peak discharge</p><p className="mt-1 font-mono text-sm font-bold text-[#cae681]">5.56 m³/s</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 -mt-px border-b border-[#dfe7df] bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-[#e2e8e2] px-4 sm:px-6 md:grid-cols-4 md:divide-y-0 lg:px-8">
            {[
              { value: "04", label: "Interactive models", icon: Layers3 },
              { value: "AI", label: "Guided practice", icon: BrainCircuit },
              { value: "Live", label: "Quiz collaboration", icon: Users },
              { value: "360°", label: "Engineering prep", icon: BookOpenCheck },
            ].map((stat) => {
              const Icon = stat.icon;
              return <div key={stat.label} className="flex items-center gap-3 px-3 py-6 sm:px-6"><Icon className="h-5 w-5 shrink-0 text-green-700" /><div><p className="text-xl font-bold tracking-tight text-[#173221]">{stat.value}</p><p className="text-xs text-[#748178]">{stat.label}</p></div></div>;
            })}
          </div>
        </section>

        <section id="platform" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="page-kicker"><Sprout className="h-4 w-4" /> One intelligent workspace</p>
                <h2 className="text-3xl font-bold leading-tight tracking-[-0.045em] text-[#14251a] sm:text-5xl">From formulas to field-ready thinking.</h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-[#69756d]">Every tool is designed around how Agricultural &amp; Environmental Engineering students actually learn, revise, and collaborate.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Link key={feature.href} href={feature.href} className={`group relative min-h-[260px] overflow-hidden rounded-[1.5rem] border border-[#dce5dc] bg-white p-6 shadow-[0_12px_36px_rgba(27,64,37,.05)] transition-all hover:-translate-y-1 hover:border-[#afc6b3] hover:shadow-[0_20px_45px_rgba(27,64,37,.1)] ${feature.className || ""}`}>
                    <div className="relative z-10 flex h-full flex-col">
                      <div className="flex items-start justify-between">
                        <span className="icon-tile"><Icon className="h-5 w-5" /></span>
                        <ArrowRight className="h-5 w-5 text-[#9ba69e] transition-transform group-hover:translate-x-1 group-hover:text-green-700" />
                      </div>
                      <div className="mt-auto pt-10">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-green-700">{feature.eyebrow}</p>
                        <h3 className="text-xl font-bold tracking-[-0.025em] text-[#173221]">{feature.title}</h3>
                        <p className="mt-2 max-w-md text-sm leading-6 text-[#6d7971]">{feature.description}</p>
                      </div>
                    </div>
                    {feature.preview && (
                      <div className="absolute right-6 top-6 hidden w-[47%] grid-cols-2 gap-2 sm:grid">
                        {simulationItems.map((item) => { const SimIcon = item.icon; return <div key={item.label} className="rounded-xl border border-[#dfE8df] bg-[#f5f8f3] p-3"><SimIcon className="h-4 w-4 text-green-700" /><p className="mt-3 text-xs font-bold">{item.label}</p><p className="mt-0.5 font-mono text-[9px] text-[#849087]">{item.value}</p></div>; })}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-[#dce6dd] bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <p className="page-kicker"><BarChart3 className="h-4 w-4" /> A better study loop</p>
              <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#15301f] sm:text-4xl">See it. Test it. Explain it.</h2>
              <p className="mt-4 text-sm leading-7 text-[#69756d]">AgriEnv connects visual understanding with active recall and peer learning, so equations become engineering judgement.</p>
              <Link href="/signup" className="btn-primary mt-7">Build your workspace <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { step: "01", icon: FlaskConical, title: "Model", text: "Adjust real parameters and see the engineering response." },
                { step: "02", icon: BrainCircuit, title: "Practise", text: "Generate focused questions with clear solutions." },
                { step: "03", icon: Trophy, title: "Master", text: "Battle coursemates and track your progress." },
              ].map((item) => { const Icon = item.icon; return <div key={item.step} className="rounded-2xl bg-[#f2f6f0] p-5"><div className="flex items-center justify-between"><Icon className="h-5 w-5 text-green-700" /><span className="font-mono text-xs font-bold text-[#9aa59c]">{item.step}</span></div><h3 className="mt-8 font-bold text-[#173221]">{item.title}</h3><p className="mt-2 text-xs leading-5 text-[#718077]">{item.text}</p></div>; })}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#153e28] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
            <div className="app-grid absolute inset-0 opacity-20" />
            <div className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-[#a4cc67]/20 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <Sprout className="mx-auto h-8 w-8 text-[#c4df7b]" />
              <h2 className="mt-5 text-3xl font-bold tracking-[-0.04em] sm:text-5xl">Your next breakthrough starts here.</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">Join your coursemates and study agricultural engineering with the tools it deserves.</p>
              <Link href="/signup" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 font-bold text-[#16452b] hover:bg-[#f1f7e8]">Create free account <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#dfe7df] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
          <Brand />
          <p className="text-center text-xs text-[#7b8880] sm:text-right">Built for the next generation of Agricultural &amp; Environmental Engineers.</p>
        </div>
      </footer>
    </div>
  );
}
