"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Choice, ControlPanel, ControlSection, Formula, Insight, Metric, RangeControl, Visualization } from "./SimulationWorkbench";
import {
  ErosionParams,
  SOIL_TYPES,
  COVER_TYPES,
  PRACTICES,
  calculateErosion,
  getSeverityColor,
} from "@/frontend/simulations/erosion";

export default function ErosionSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [params, setParams] = useState<ErosionParams>({
    rainfallFactor: 300,
    soilErodibility: 0.3,
    slopeLength: 50,
    slopeGradient: 10,
    coverFactor: 0.35,
    practiceFactor: 1.0,
  });
  const [soilType, setSoilType] = useState("clayLoam");
  const [coverType, setCoverType] = useState("crops");
  const [practice, setPractice] = useState("none");

  const drawSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;
    const result = calculateErosion(params);
    const time = Date.now() / 1000;
    const severity = Math.min(result.soilLoss / 30, 2);

    ctx.clearRect(0, 0, w, h);

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#234c3b");
    sky.addColorStop(1, "#456b54");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#d0dfb620";
    for (let x = 18; x < w; x += 24) for (let y = 18; y < h; y += 24) ctx.fillRect(x, y, 1, 1);

    // Slope
    const slopeStartY = h * 0.3;
    const slopeEndY = h * (0.45 + params.slopeGradient / 45 * 0.4);

    const soilColor = ({ clay: "#a18362", clayLoam: "#a49a70", siltLoam: "#b6a876", sandyLoam: "#bdac80", sand: "#d0c19a" } as Record<string, string>)[soilType];
    ctx.fillStyle = soilColor;
    ctx.beginPath();
    ctx.moveTo(0, slopeStartY);
    ctx.lineTo(w, slopeEndY);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.clip();
    ctx.strokeStyle = "#eddfb930";
    ctx.lineWidth = 1;
    for (let i = 1; i < 12; i++) {
      ctx.beginPath(); ctx.moveTo(0, slopeStartY + i * 18); ctx.lineTo(w, slopeEndY + i * 18); ctx.stroke();
    }
    ctx.restore();

    // Erosion rills / gullies
    const rillCount = Math.floor(severity * 6);
    ctx.strokeStyle = `rgba(115, 84, 44, ${0.2 + severity * 0.15})`;
    ctx.lineWidth = 1 + severity;
    for (let i = 0; i < rillCount; i++) {
      const startX = (i / rillCount) * w;
      ctx.beginPath();
      const inset = 8 + (i % 4) * 6;
      ctx.moveTo(startX, slopeStartY + (startX / w) * (slopeEndY - slopeStartY) + inset);
      for (let x = startX; x < w; x += 10) {
        const progress = x / w;
        const baseY = slopeStartY + progress * (slopeEndY - slopeStartY) + inset;
        const wobble = Math.sin(x * 0.06 + i * 2) * 2;
        ctx.lineTo(x, baseY + wobble);
      }
      ctx.stroke();
    }

    // Sediment particles moving downslope
    ctx.fillStyle = `rgba(160, 80, 30, ${0.5 + severity * 0.4})`;
    for (let i = 0; i < severity * 50; i++) {
      const px = ((i * 31 + time * 30 * (1 + severity)) % w);
      const progress = px / w;
      const py = slopeStartY + progress * (slopeEndY - slopeStartY) + Math.sin(px * 0.1 + time) * 5;
      const size = 1 + (i % 3) * (1 + severity);
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vegetation cover
    const vegCount = Math.floor((1 - params.coverFactor) * 80);
    ctx.fillStyle = "#b8d78d";
    for (let i = 0; i < vegCount; i++) {
      const vx = (i * 47) % w;
      const progress = vx / w;
      const vy = slopeStartY + progress * (slopeEndY - slopeStartY) - 5;
      ctx.beginPath();
      ctx.arc(vx, vy, 3 + (i % 4), 0, Math.PI * 2);
      ctx.fill();
    }

    // Terraces if practice selected
    if (params.practiceFactor < 0.5) {
      ctx.strokeStyle = "rgba(100, 80, 60, 0.8)";
      ctx.lineWidth = 3;
      const terraceCount = params.practiceFactor < 0.2 ? 5 : 3;
      for (let i = 1; i <= terraceCount; i++) {
        const ty = slopeStartY + (i / (terraceCount + 1)) * (slopeEndY - slopeStartY);
        ctx.beginPath();
        ctx.moveTo(0, ty);
        ctx.lineTo(w, ty);
        ctx.stroke();
      }
    }

    // Sediment deposition at bottom
    const depositionHeight = severity * h * 0.08;
    ctx.fillStyle = `rgba(180, 120, 60, ${0.3 + severity * 0.5})`;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.quadraticCurveTo(w * 0.5, h - depositionHeight, w, h);
    ctx.closePath();
    ctx.fill();

    ctx.font = "9px monospace";
    ctx.fillStyle = "#d4e6c1";
    ctx.fillText("HILLSLOPE PROFILE", 15, 22);
    ctx.fillText(`${params.slopeLength} m / ${params.slopeGradient}°`, 15, 39);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) animationRef.current = requestAnimationFrame(drawSimulation);
  }, [params, soilType]);

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

  const result = calculateErosion(params);
  const sevColor = getSeverityColor(result.severity);

  return (
    <div className="sim-layout">
      <ControlPanel onReset={() => { setSoilType("clayLoam"); setCoverType("crops"); setPractice("none"); setParams({ rainfallFactor: 300, soilErodibility: 0.3, slopeLength: 50, slopeGradient: 10, coverFactor: 0.35, practiceFactor: 1 }); }}>
        <ControlSection number="01" title="Soil composition">
          {Object.entries(SOIL_TYPES).map(([key, val]) => <Choice key={key} selected={soilType === key} onClick={() => { setSoilType(key); setParams(p => ({ ...p, soilErodibility: val.K })); }} label={val.label} detail={`K ${val.K.toFixed(2)}`} color={val.color} />)}
        </ControlSection>
        <ControlSection number="02" title="Cover & conservation">
          <label htmlFor="erosion-cover" className="sim-select-label">Vegetation cover</label>
          <select id="erosion-cover" value={coverType} onChange={e => { setCoverType(e.target.value); setParams(p => ({ ...p, coverFactor: COVER_TYPES[e.target.value].C })); }} className="sim-select">
            {Object.entries(COVER_TYPES).map(([key, val]) => <option key={key} value={key}>{val.label} · C = {val.C}</option>)}
          </select>
          <label htmlFor="erosion-practice" className="sim-select-label mt-4">Conservation practice</label>
          <select id="erosion-practice" value={practice} onChange={e => { setPractice(e.target.value); setParams(p => ({ ...p, practiceFactor: PRACTICES[e.target.value].P })); }} className="sim-select">
            {Object.entries(PRACTICES).map(([key, val]) => <option key={key} value={key}>{val.label} · P = {val.P}</option>)}
          </select>
        </ControlSection>
        <ControlSection number="03" title="Rainfall & terrain">
          <RangeControl label="Rainfall erosivity (R)" value={params.rainfallFactor} min={50} max={800} step={10} onChange={rainfallFactor => setParams(p => ({ ...p, rainfallFactor }))} />
          <RangeControl label="Slope length" value={params.slopeLength} unit="m" min={10} max={200} step={5} onChange={slopeLength => setParams(p => ({ ...p, slopeLength }))} />
          <RangeControl label="Slope angle" value={params.slopeGradient} unit="°" min={1} max={45} step={1} onChange={slopeGradient => setParams(p => ({ ...p, slopeGradient }))} />
        </ControlSection>
      </ControlPanel>
      <div className="min-w-0">
        <div className="sim-metrics">
          <Metric primary label="Annual soil loss" value={result.soilLoss} unit="t/ha/yr" note="Estimated with the USLE model" />
          <Metric label="Topographic factor" value={result.lsFactor} note="Combined slope length & steepness" />
          <Metric label="Erosion severity" value={result.severity.charAt(0).toUpperCase() + result.severity.slice(1)} note="Based on estimated annual loss" />
        </div>
        <Visualization title="Hillslope profile" subtitle="Illustrative soil movement & vegetation cover" action={<span className="rounded-full border border-white/20 px-3 py-1 text-[10px] text-white"><span style={{ color: sevColor }}>●</span> {result.severity} erosion</span>} legend={<span><span className="text-[#bbd999]">● Vegetation</span><span className="mx-3 text-[#edc394]">● Soil transport</span></span>}>
          <canvas ref={canvasRef} className="w-full" role="img" aria-label={`Hillslope model with ${result.severity} erosion and estimated soil loss of ${result.soilLoss} tonnes per hectare per year`} />
        </Visualization>
        <dl className="sim-detail-grid"><div><dt>Soil erodibility · K</dt><dd>{params.soilErodibility.toFixed(2)}</dd></div><div><dt>Cover factor · C</dt><dd>{params.coverFactor.toFixed(2)}</dd></div><div><dt>Practice factor · P</dt><dd>{params.practiceFactor.toFixed(2)}</dd></div></dl>
        <Formula name="USLE · A = R × K × LS × C × P">{result.formulaDisplay}</Formula>
        <Insight title="Small changes can protect more soil">Try grass cover or contour farming while keeping your terrain unchanged. Watch how the cover and practice factors reduce estimated soil loss.</Insight>
      </div>
    </div>
  );
}
