"use client";

import Link from "next/link";
import { ArrowRight, Droplets, FlaskConical, Gauge, Mountain, Pipette, Waves } from "lucide-react";
import Navbar from "@/frontend/components/layout/Navbar";
import PageHeader from "@/frontend/components/layout/PageHeader";

const simulations = [
  { href: "/simulate/runoff", icon: Droplets, number: "01", title: "Runoff calculator", formula: "Q = CiA / 360", description: "See how land cover, rainfall intensity, and catchment area shape peak discharge.", tag: "Hydrology", accent: "bg-[#dcefea] text-[#176858]" },
  { href: "/simulate/irrigation", icon: Pipette, number: "02", title: "Irrigation designer", formula: "CU & DU Analysis", description: "Place sprinklers, adjust pressure, and inspect the distribution pattern across a field.", tag: "Water systems", accent: "bg-[#e4f1dc] text-[#3c6f31]" },
  { href: "/simulate/erosion", icon: Mountain, number: "03", title: "Soil erosion simulator", formula: "A = R · K · LS · C · P", description: "Model soil loss across soil types, terrain, cover, and conservation practices.", tag: "Conservation", accent: "bg-[#f0ecda] text-[#746127]" },
  { href: "/simulate/drainage", icon: Waves, number: "04", title: "Drainage designer", formula: "Q = 1/n · A · R²⁄³ · S½", description: "Design channel cross-sections and assess velocity, discharge, and flow regime.", tag: "Hydraulics", accent: "bg-[#e1ece9] text-[#39665a]" },
];

export default function SimulationHub() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-container">
        <PageHeader eyebrow="Simulation studio" title="Make engineering visible." description="Move beyond memorising formulas. Change the variables, observe the system, and build the intuition behind every calculation." icon={FlaskConical} meta="4 INTERACTIVE ENGINEERING MODELS">
          <div className="hidden rounded-2xl border border-[#dbe6dc] bg-[#f5f8f3] p-4 sm:block">
            <Gauge className="h-6 w-6 text-green-700" />
            <p className="mt-3 text-xs font-bold text-[#2e4937]">Live parameters</p>
            <p className="mt-1 text-[11px] text-[#7b887f]">Results update instantly</p>
          </div>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-2">
          {simulations.map((sim) => {
            const Icon = sim.icon;
            return (
              <Link key={sim.href} href={sim.href} className="card card-interactive group relative min-h-[285px] overflow-hidden p-0 sm:p-0">
                <div className="absolute inset-x-0 top-0 h-1 bg-[#1d6b3f] opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="flex h-full flex-col p-5 sm:p-7">
                  <div className="flex items-start justify-between">
                    <span className={`grid h-12 w-12 place-items-center rounded-2xl ${sim.accent}`}><Icon className="h-5 w-5" /></span>
                    <span className="font-mono text-xs font-bold text-[#a3ada5]">{sim.number}</span>
                  </div>
                  <div className="mt-auto pt-12">
                    <span className="rounded-full bg-[#f0f4ef] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#66806e]">{sim.tag}</span>
                    <h2 className="mt-4 text-xl font-bold tracking-[-0.025em] text-[#183021] sm:text-2xl">{sim.title}</h2>
                    <code className="mt-2 inline-block font-mono text-xs font-semibold text-green-700">{sim.formula}</code>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#6c7870]">{sim.description}</p>
                    <div className="mt-5 flex items-center gap-2 text-sm font-bold text-green-700">Open model <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
