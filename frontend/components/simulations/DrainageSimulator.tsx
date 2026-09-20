"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ControlPanel, ControlSection, Formula, Insight, Metric, RangeControl, Visualization } from "./SimulationWorkbench";
import {
  DrainageParams,
  CHANNEL_ROUGHNESS,
  calculateDrainage,
} from "@/frontend/simulations/drainage";

export default function DrainageSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [params, setParams] = useState<DrainageParams>({
    channelType: "trapezoidal",
    width: 3,
    depth: 1.5,
    sideSlope: 1.5,
    roughness: 0.022,
    bedSlope: 0.002,
    diameter: 1.5,
  });
  const [roughnessKey, setRoughnessKey] = useState("earth");

  const drawSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;
    const result = calculateDrainage(params);
    const time = Date.now() / 1000;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#204631";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(193, 219, 183, .07)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    const circular = params.channelType === "circular";
    const side = params.channelType === "trapezoidal" ? params.sideSlope : 0;
    const profileWidth = circular ? params.diameter : params.width + 2 * side * params.depth;
    const profileHeight = circular ? params.diameter : params.depth;
    const scale = Math.min(w * 0.65 / profileWidth, h * 0.54 / profileHeight);
    const cx = w / 2;
    const top = h * 0.2;
    const bottom = top + profileHeight * scale;
    const halfBase = params.width * scale / 2;
    const halfTop = profileWidth * scale / 2;
    const path = new Path2D();
    if (circular) {
      path.arc(cx, top + params.diameter * scale / 2, params.diameter * scale / 2, 0, Math.PI * 2);
    } else {
      path.moveTo(cx - halfTop, top);
      path.lineTo(cx - halfBase, bottom);
      path.lineTo(cx + halfBase, bottom);
      path.lineTo(cx + halfTop, top);
      path.closePath();
      // Subtle ground section around the excavated channel.
      ctx.fillStyle = "#817e55";
      ctx.fillRect(w * 0.07, top - 7, w * 0.86, bottom - top + 23);
      ctx.strokeStyle = "#d0caa080";
      for (let x = w * 0.07; x < w * 0.93; x += 16) {
        ctx.beginPath(); ctx.moveTo(x, top - 7); ctx.lineTo(x - 8, top - 15); ctx.stroke();
      }
    }
    ctx.fillStyle = "#153c31";
    ctx.fill(path);
    const waterY = circular ? bottom - params.depth * scale : top + 7;
    ctx.save();
    ctx.clip(path);
    const water = ctx.createLinearGradient(0, waterY, 0, bottom);
    water.addColorStop(0, "#80c2c4");
    water.addColorStop(1, "#2a7c82");
    ctx.fillStyle = water;
    ctx.beginPath();
    ctx.moveTo(0, bottom);
    for (let x = 0; x <= w; x += 3) ctx.lineTo(x, waterY + Math.sin(x * .035 + time * 1.8) * 2);
    ctx.lineTo(w, bottom); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#c8e7df";
    ctx.lineWidth = 1;
    for (let i = 0; i < 24; i++) {
      const x = ((i * 47 + time * Math.min(result.velocity, 8) * 15) % w);
      const y = waterY + 12 + (i * 31 % Math.max(1, bottom - waterY - 20));
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10, y); ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = "#d7cc9e";
    ctx.lineWidth = 3;
    ctx.stroke(path);

    ctx.strokeStyle = "#9eb897";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    const dimensionHalf = circular ? halfTop : halfBase;
    const dimensionY = Math.min(bottom + 28, h - 30);
    ctx.beginPath(); ctx.moveTo(cx - dimensionHalf, dimensionY); ctx.lineTo(cx + dimensionHalf, dimensionY); ctx.stroke();
    ctx.setLineDash([]);
    for (const x of [cx - dimensionHalf, cx + dimensionHalf]) { ctx.beginPath(); ctx.moveTo(x, dimensionY - 4); ctx.lineTo(x, dimensionY + 4); ctx.stroke(); }
    ctx.fillStyle = "#d6e3bf";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(circular ? `D = ${params.diameter} m` : `b = ${params.width} m`, cx, dimensionY + 17);
    ctx.textAlign = "left";
    ctx.fillText(`y = ${params.depth} m`, Math.min(cx + halfTop + 12, w - 88), top + (bottom - top) / 2);
    ctx.font = "9px monospace";
    ctx.fillStyle = "#98b19b";
    ctx.fillText("SECTION A–A", 15, 22);

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) animationRef.current = requestAnimationFrame(drawSimulation);
  }, [params]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeCanvas = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = Math.min(rect.width * 0.6, 400);
      cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(drawSimulation);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [drawSimulation]);

  const result = calculateDrainage(params);
  const regimeColor = result.flowRegime === "subcritical" ? "#22c55e" : result.flowRegime === "critical" ? "#eab308" : "#ef4444";

  return (
    <div className="sim-layout">
      <ControlPanel onReset={() => { setRoughnessKey("earth"); setParams({ channelType: "trapezoidal", width: 3, depth: 1.5, sideSlope: 1.5, roughness: 0.022, bedSlope: 0.002, diameter: 1.5 }); }}>
        <ControlSection number="01" title="Channel profile">
          <div className="grid grid-cols-3 gap-2">
            {(["rectangular", "trapezoidal", "circular"] as const).map(type => <button type="button" key={type} aria-pressed={params.channelType === type} onClick={() => setParams(p => ({ ...p, channelType: type, depth: type === "circular" ? Math.min(p.depth, p.diameter) : p.depth }))} className={`flex flex-col items-center gap-3 rounded-lg border px-1 py-3 text-[9px] capitalize transition-colors ${params.channelType === type ? "border-[#a5bf85] bg-[#edf4e2] text-[#37572b]" : "border-[#e7ebdf] text-[#829077] hover:bg-[#f7f9f1]"}`}><svg width="36" height="25" viewBox="0 0 36 25" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{type === "circular" ? <circle cx="18" cy="12" r="10" /> : <path d={type === "rectangular" ? "M5 3V21H31V3" : "M2 3L10 21H26L34 3"} />}<path d="M11 13H25" strokeDasharray="2 2" /></svg>{type}</button>)}
          </div>
          <label htmlFor="channel-surface" className="sim-select-label mt-5">Channel surface</label>
          <select id="channel-surface" className="sim-select" value={roughnessKey} onChange={e => { setRoughnessKey(e.target.value); setParams(p => ({ ...p, roughness: CHANNEL_ROUGHNESS[e.target.value].n })); }}>
            {Object.entries(CHANNEL_ROUGHNESS).map(([key, val]) => <option key={key} value={key}>{val.label} · n = {val.n}</option>)}
          </select>
        </ControlSection>
        <ControlSection number="02" title="Channel dimensions">
          {params.channelType !== "circular" ? <>
            <RangeControl label="Bottom width" value={params.width} unit="m" min={0.5} max={10} step={0.5} onChange={width => setParams(p => ({ ...p, width }))} />
            <RangeControl label="Flow depth" value={params.depth} unit="m" min={0.1} max={5} step={0.1} onChange={depth => setParams(p => ({ ...p, depth }))} />
            {params.channelType === "trapezoidal" && <RangeControl label="Side slope · horizontal : vertical" value={params.sideSlope} unit=": 1" min={0.5} max={4} step={0.5} onChange={sideSlope => setParams(p => ({ ...p, sideSlope }))} />}
          </> : <>
            <RangeControl label="Pipe diameter" value={params.diameter} unit="m" min={0.3} max={3} step={0.1} onChange={diameter => setParams(p => ({ ...p, diameter, depth: Math.min(p.depth, diameter) }))} />
            <RangeControl label="Flow depth" value={params.depth} unit="m" min={0.1} max={params.diameter} step={0.1} onChange={depth => setParams(p => ({ ...p, depth }))} />
          </>}
        </ControlSection>
        <ControlSection number="03" title="Longitudinal gradient">
          <RangeControl label="Bed slope" value={params.bedSlope} unit="m/m" min={0.0001} max={0.05} step={0.0001} onChange={bedSlope => setParams(p => ({ ...p, bedSlope }))} />
        </ControlSection>
      </ControlPanel>
      <div className="min-w-0">
        <div className="sim-metrics">
          <Metric primary label="Discharge capacity" value={result.discharge} unit="m³/s" note="At the selected flow depth" />
          <Metric label="Flow velocity" value={result.velocity} unit="m/s" note="Average channel velocity" />
          <Metric label="Hydraulic radius" value={result.hydraulicRadius} unit="m" note="Flow area ÷ wetted perimeter" />
        </div>
        <Visualization title="Channel cross-section" subtitle={`${params.channelType.charAt(0).toUpperCase() + params.channelType.slice(1)} profile · ${CHANNEL_ROUGHNESS[roughnessKey].label}`} action={<span className="rounded-full border border-white/20 px-3 py-1 text-[10px] text-white"><span style={{ color: regimeColor }}>●</span> {result.flowRegime}</span>} legend={<span><span className="text-[#d4c7a5]">● Channel bed</span><span className="mx-3 text-[#8bd3d7]">● Water profile</span></span>}>
          <canvas ref={canvasRef} className="w-full" role="img" aria-label={`${params.channelType} drainage channel cross-section with ${params.depth} metres flow depth`} />
        </Visualization>
        <dl className="sim-detail-grid"><div><dt>Flow area</dt><dd>{result.flowArea} m²</dd></div><div><dt>Wetted perimeter</dt><dd>{result.wettedPerimeter} m</dd></div><div><dt>Froude number</dt><dd>{result.froudeNumber}</dd></div></dl>
        <Formula name="Manning’s equation">{result.formulaDisplay}</Formula>
        <Insight title="Balance shape, slope, and surface">A smoother lining or steeper bed increases velocity. Change the channel profile to see how its area and wetted perimeter affect discharge.</Insight>
      </div>
    </div>
  );
}
