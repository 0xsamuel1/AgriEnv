"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Info } from "lucide-react";
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
    const severity = result.soilLoss / 30;

    ctx.clearRect(0, 0, w, h);

    // Sky
    ctx.fillStyle = `rgba(135, 180, 220, ${0.8 - severity * 0.3})`;
    ctx.fillRect(0, 0, w, h * 0.3);

    // Slope
    const slopeStartY = h * 0.3;
    const slopeEndY = h * 0.8;

    const soilColor = SOIL_TYPES[soilType].color;
    ctx.fillStyle = soilColor;
    ctx.beginPath();
    ctx.moveTo(0, slopeStartY);
    ctx.lineTo(w, slopeEndY);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Erosion rills / gullies
    const rillCount = Math.floor(severity * 15);
    ctx.strokeStyle = `rgba(120, 60, 20, ${0.3 + severity * 0.5})`;
    ctx.lineWidth = 1 + severity * 3;
    for (let i = 0; i < rillCount; i++) {
      const startX = (i / rillCount) * w;
      ctx.beginPath();
      ctx.moveTo(startX, slopeStartY + (i / rillCount) * (slopeEndY - slopeStartY) * 0.3);
      for (let x = startX; x < w; x += 10) {
        const progress = (x - startX) / (w - startX);
        const baseY = slopeStartY + progress * (slopeEndY - slopeStartY);
        const wobble = Math.sin(x * 0.1 + i * 2) * (3 + severity * 5);
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
      const size = 1 + Math.random() * (2 + severity * 3);
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vegetation cover
    const vegCount = Math.floor((1 - params.coverFactor) * 80);
    ctx.fillStyle = "#22c55e";
    for (let i = 0; i < vegCount; i++) {
      const vx = (i * 47) % w;
      const progress = vx / w;
      const vy = slopeStartY + progress * (slopeEndY - slopeStartY) - 5;
      ctx.beginPath();
      ctx.arc(vx, vy, 3 + Math.random() * 4, 0, Math.PI * 2);
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

    animationRef.current = requestAnimationFrame(drawSimulation);
  }, [params, soilType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeCanvas = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = Math.min(rect.width * 0.6, 400);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    animationRef.current = requestAnimationFrame(drawSimulation);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [drawSimulation]);

  const result = calculateErosion(params);
  const sevColor = getSeverityColor(result.severity);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <div className="card p-0 overflow-hidden">
          <canvas ref={canvasRef} className="w-full" />
        </div>
        <div className="card mt-4 bg-[#eef4ed]">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm font-semibold">USLE Formula</span>
          </div>
          <code className="text-sm font-mono break-all">{result.formulaDisplay}</code>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="card">
          <h3 className="font-bold mb-3">Soil Type</h3>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(SOIL_TYPES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { setSoilType(key); setParams(p => ({ ...p, soilErodibility: val.K })); }}
                className={`flex items-center gap-3 p-2.5 rounded-xl text-sm transition-all text-left ${
                  soilType === key ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] hover:bg-[var(--border)]"
                }`}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: val.color }} />
                <span className="flex-1">{val.label}</span>
                <span className="text-xs opacity-80">K={val.K}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-3">Cover &amp; Practice</h3>
          <div className="space-y-3">
            <select
              value={coverType}
              onChange={(e) => { setCoverType(e.target.value); setParams(p => ({ ...p, coverFactor: COVER_TYPES[e.target.value].C })); }}
              className="input-field text-sm"
            >
              {Object.entries(COVER_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v.label} (C={v.C})</option>
              ))}
            </select>
            <select
              value={practice}
              onChange={(e) => { setPractice(e.target.value); setParams(p => ({ ...p, practiceFactor: PRACTICES[e.target.value].P })); }}
              className="input-field text-sm"
            >
              {Object.entries(PRACTICES).map(([k, v]) => (
                <option key={k} value={k}>{v.label} (P={v.P})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-3">Terrain</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Rainfall Factor (R)</span>
                <span className="font-mono font-bold">{params.rainfallFactor}</span>
              </div>
              <input type="range" min={50} max={800} step={10} value={params.rainfallFactor}
                onChange={e => setParams(p => ({ ...p, rainfallFactor: +e.target.value }))}
                className="w-full accent-[var(--primary)]" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Slope Length</span>
                <span className="font-mono font-bold">{params.slopeLength} m</span>
              </div>
              <input type="range" min={10} max={200} step={5} value={params.slopeLength}
                onChange={e => setParams(p => ({ ...p, slopeLength: +e.target.value }))}
                className="w-full accent-[var(--primary)]" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Slope Gradient</span>
                <span className="font-mono font-bold">{params.slopeGradient}°</span>
              </div>
              <input type="range" min={1} max={45} step={1} value={params.slopeGradient}
                onChange={e => setParams(p => ({ ...p, slopeGradient: +e.target.value }))}
                className="w-full accent-[var(--primary)]" />
            </div>
          </div>
        </div>

        <div className="card" style={{ borderColor: sevColor, borderWidth: 2 }}>
          <h3 className="font-bold mb-3">Results</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Soil Loss</span>
              <span className="font-bold font-mono text-lg" style={{ color: sevColor }}>{result.soilLoss} t/ha/yr</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">LS Factor</span>
              <span className="font-bold font-mono">{result.lsFactor}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Severity</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: sevColor }}>
                {result.severity.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
