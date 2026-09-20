"use client";

import Link from "next/link";
import { useId, type CSSProperties, type ReactNode } from "react";
import { ArrowLeft, ArrowUpRight, Check, ChevronRight, CloudRain, Droplets, FlaskConical, Mountain, RotateCcw, SlidersHorizontal, Waves } from "lucide-react";
import Navbar from "@/frontend/components/layout/Navbar";

const tools = {
  runoff: { title: "Runoff calculator", short: "Runoff", category: "Catchment hydrology", description: "Follow the rain. Understand the flow.", detail: "Explore how rainfall and land cover shape the water leaving your catchment.", icon: CloudRain, model: "Rational method", number: "01" },
  irrigation: { title: "Irrigation designer", short: "Irrigation", category: "Precision water application", description: "Every drop, in the right place.", detail: "Build your sprinkler layout and discover a more even distribution of water.", icon: Droplets, model: "Christiansen uniformity", number: "02" },
  erosion: { title: "Soil erosion simulator", short: "Soil erosion", category: "Soil & land conservation", description: "Better cover. Stronger ground.", detail: "See how terrain, rainfall, and conservation choices influence annual soil loss.", icon: Mountain, model: "Universal soil loss equation", number: "03" },
  drainage: { title: "Drainage designer", short: "Drainage", category: "Open-channel hydraulics", description: "Give water a better way through.", detail: "Shape your channel and explore the relationship between capacity and flow.", icon: Waves, model: "Manning’s equation", number: "04" },
};

export default function SimulationWorkbench({ tool, children }: { tool: keyof typeof tools; children: ReactNode }) {
  const current = tools[tool];
  const Icon = current.icon;
  return (
    <div className="sim-page min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-[1440px] px-4 pb-12 pt-7 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3 text-xs text-[#788178]">
          <Link href="/simulate" className="flex items-center gap-2 font-medium hover:text-[#17643a]"><ArrowLeft size={14} /> Simulation lab</Link>
          <span className="hidden items-center gap-2 sm:flex"><FlaskConical size={13} /> Interactive learning workspace</span>
        </div>
        <header className="sim-hero">
          <div className="sim-hero-contours" aria-hidden="true" />
          <div className="relative z-10 max-w-3xl">
            <div className="mb-5 flex items-center gap-3"><span className="sim-hero-icon"><Icon size={23} strokeWidth={1.5} /></span><span className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#bed2c4]">{current.category}</span></div>
            <h1 className="text-3xl font-semibold tracking-[-.045em] text-white sm:text-4xl lg:text-[44px]">{current.title}</h1>
            <p className="mt-3 text-lg tracking-tight text-[#dce9cb]">{current.description}</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#adc4b5]">{current.detail}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-[10px] font-medium sm:text-xs"><span className="rounded-full border border-white/15 px-3 py-1.5 text-[#d7e4db]">{current.model}</span><span className="flex items-center gap-2 px-1 text-[#c7e493]"><span className="h-1.5 w-1.5 rounded-full bg-[#c7e493]" /> Results update as you explore</span></div>
          </div>
          <span aria-hidden="true" className="absolute bottom-1 right-8 hidden font-mono text-[140px] font-light leading-none tracking-tighter text-white/[.045] lg:block">{current.number}</span>
        </header>
        <nav aria-label="Simulation tools" className="sim-tool-nav">
          {Object.entries(tools).map(([key, item]) => <Link key={key} href={`/simulate/${key}`} aria-current={key === tool ? "page" : undefined} className={`sim-tool-tab ${key === tool ? "is-active" : ""}`}><item.icon size={16} /><span>{item.short}</span><ArrowUpRight className="ml-auto hidden sm:block" size={13} /></Link>)}
        </nav>
        {children}
        <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#dfe5db] pt-5 text-[11px] text-[#7c867c]"><span>AgriEnv / Simulation lab</span><span>Explore a scenario. Change a variable. See what happens.</span></footer>
      </main>
    </div>
  );
}

export function ControlPanel({ children, onReset }: { children: ReactNode; onReset: () => void }) {
  return <aside className="sim-controls"><div className="sim-panel-heading"><h2 className="flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal size={16} /> Model inputs</h2><button type="button" onClick={onReset} className="sim-reset"><RotateCcw size={12} /> Reset</button></div><div className="p-5">{children}</div></aside>;
}

export function ControlSection({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <section className="sim-control-section"><h3 className="mb-4 flex items-center gap-2 text-xs font-semibold"><span className="sim-step">{number}</span>{title}</h3>{children}</section>;
}

export function RangeControl({ label, value, unit = "", min, max, step, onChange }: { label: string; value: number; unit?: string; min: number; max: number; step: number; onChange: (value: number) => void }) {
  const id = useId();
  return <div className="sim-range"><div className="mb-3 flex items-center justify-between gap-2"><label htmlFor={id} className="text-xs text-[#68736b]">{label}</label><output htmlFor={id} className="sim-range-value">{value}<span>{unit}</span></output></div><input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} style={{ "--range-progress": `${((value - min) / (max - min)) * 100}%` } as CSSProperties} /><div className="mt-1 flex justify-between font-mono text-[9px] text-[#929b91]"><span>{min} {unit}</span><span>{max} {unit}</span></div></div>;
}

export function Choice({ selected, onClick, label, detail, color }: { selected: boolean; onClick: () => void; label: string; detail: string; color?: string }) {
  return <button type="button" onClick={onClick} aria-pressed={selected} className={`sim-choice ${selected ? "is-selected" : ""}`}><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color || "#71966c" }} /><span className="flex-1 text-left">{label}</span><span className="font-mono text-[10px] opacity-65">{detail}</span>{selected ? <Check size={13} /> : <span className="w-[13px]" />}</button>;
}

export function Metric({ label, value, unit, note, primary = false }: { label: string; value: number | string; unit?: string; note: string; primary?: boolean }) {
  return <div className={`sim-metric ${primary ? "is-primary" : ""}`}><p className="sim-metric-label">{label}</p><div className="mt-3 flex flex-wrap items-baseline gap-x-2"><span className="sim-metric-number">{typeof value === "number" ? value.toLocaleString("en-US", { maximumFractionDigits: 3 }) : value}</span><span className="text-xs opacity-60">{unit}</span></div><p className="mt-3 text-[10px] leading-4 opacity-60">{note}</p></div>;
}

export function Visualization({ title, subtitle, children, legend, action }: { title: string; subtitle: string; children: ReactNode; legend: ReactNode; action?: ReactNode }) {
  return <section className="sim-visual"><div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6"><div><div className="mb-1 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#bedf8b]" /><h2 className="text-sm font-medium text-white">{title}</h2></div><p className="text-[10px] text-[#9eafa6]">{subtitle}</p></div>{action || <span className="sim-live">LIVE MODEL</span>}</div><div className="sim-canvas-wrap">{children}</div><div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-5 py-3 text-[10px] text-[#bac9bf] sm:px-6">{legend}<span className="font-mono text-[9px] text-[#819b8b]">{`AGRIENV / MODEL VIEW`}</span></div></section>;
}

export function Formula({ name, children }: { name: string; children: ReactNode }) {
  return <section className="sim-formula"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#6a776a]"><FlaskConical size={13} /> {name}<ChevronRight size={12} /></div><code className="mt-2 block break-words text-xs leading-6 text-[#24482f]">{children}</code></section>;
}

export function Insight({ title, children }: { title: string; children: ReactNode }) {
  return <div className="sim-insight"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e0ebcf] text-[#536c36]"><FlaskConical size={12} /></span><div><h3 className="text-xs font-semibold text-[#405739]">{title}</h3><p className="mt-1 text-xs leading-6 text-[#74806c]">{children}</p></div></div>;
}
