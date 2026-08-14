"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Info } from "lucide-react";
import {
  RunoffParams,
  LAND_USE_COEFFICIENTS,
  calculateRunoff,
  getRunoffVisualizationData,
} from "@/frontend/simulations/runoff";

export default function RunoffSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [params, setParams] = useState<RunoffParams>({
    runoffCoefficient: 0.4,
    rainfallIntensity: 50,
    catchmentArea: 100,
  });
  const [selectedLandUse, setSelectedLandUse] = useState("cropland");

  const drawSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;

    const data = getRunoffVisualizationData(params);
    const time = Date.now() / 1000;

    ctx.clearRect(0, 0, w, h);

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
    skyGrad.addColorStop(0, `rgba(100, 150, 200, ${0.3 + data.intensity * 0.5})`);
    skyGrad.addColorStop(1, `rgba(180, 210, 240, ${0.2 + data.intensity * 0.3})`);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.4);

    // Rain drops
    ctx.strokeStyle = `rgba(100, 150, 255, ${0.3 + data.intensity * 0.5})`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < data.rainDrops; i++) {
      const x = ((i * 37 + time * 100) % w);
      const y = ((i * 53 + time * 200) % (h * 0.5));
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 2, y + 10);
      ctx.stroke();
    }

    // Ground / Hillside
    const landColor = LAND_USE_COEFFICIENTS[selectedLandUse].color;
    ctx.fillStyle = landColor;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.45);
    ctx.quadraticCurveTo(w * 0.3, h * 0.35, w * 0.5, h * 0.5);
    ctx.quadraticCurveTo(w * 0.7, h * 0.6, w, h * 0.55);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Surface runoff streams
    const streamLevel = data.waterLevel;
    if (streamLevel > 0) {
      ctx.fillStyle = `rgba(30, 100, 200, ${0.3 + streamLevel * 0.4})`;
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.5);
      for (let x = w * 0.5; x <= w; x += 5) {
        const progress = (x - w * 0.5) / (w * 0.5);
        const baseY = h * 0.5 + progress * h * 0.15;
        const wave = Math.sin(x * 0.05 + time * 3) * 3 * streamLevel;
        ctx.lineTo(x, baseY + wave);
      }
      ctx.lineTo(w, h * 0.85);
      ctx.lineTo(w * 0.5, h * 0.75);
      ctx.closePath();
      ctx.fill();

      // Collection point / outlet
      const outletSize = 20 + streamLevel * 40;
      ctx.fillStyle = `rgba(30, 80, 180, ${0.4 + streamLevel * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(w * 0.85, h * 0.75, outletSize, outletSize * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vegetation dots based on land use
    const vegDensity = 1 - params.runoffCoefficient;
    ctx.fillStyle = "#22c55e";
    for (let i = 0; i < vegDensity * 60; i++) {
      const vx = (i * 47) % w;
      const vy = h * 0.4 + ((i * 71) % (h * 0.4));
      ctx.beginPath();
      ctx.arc(vx, vy, 2 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    animationRef.current = requestAnimationFrame(drawSimulation);
  }, [params, selectedLandUse]);

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

  const result = calculateRunoff(params);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <div className="card p-0 overflow-hidden">
          <canvas ref={canvasRef} className="w-full" />
        </div>

        <div className="card mt-4 bg-[#eef4ed]">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm font-semibold">Live Formula</span>
          </div>
          <code className="text-sm font-mono text-[var(--foreground)] break-all">
            {result.formulaDisplay}
          </code>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="card">
          <h3 className="font-bold mb-4">Land Use Type</h3>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(LAND_USE_COEFFICIENTS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedLandUse(key);
                  setParams((p) => ({ ...p, runoffCoefficient: val.C }));
                }}
                className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all text-left ${
                  selectedLandUse === key
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--muted)] hover:bg-[var(--border)]"
                }`}
              >
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: val.color }} />
                <span className="flex-1">{val.label}</span>
                <span className="text-xs opacity-80">C = {val.C}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-4">Parameters</h3>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Rainfall Intensity (i)</span>
                <span className="font-mono font-bold">{params.rainfallIntensity} mm/hr</span>
              </div>
              <input
                type="range"
                min={5}
                max={200}
                step={5}
                value={params.rainfallIntensity}
                onChange={(e) => setParams((p) => ({ ...p, rainfallIntensity: +e.target.value }))}
                className="w-full accent-[var(--primary)]"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Catchment Area (A)</span>
                <span className="font-mono font-bold">{params.catchmentArea} ha</span>
              </div>
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={params.catchmentArea}
                onChange={(e) => setParams((p) => ({ ...p, catchmentArea: +e.target.value }))}
                className="w-full accent-[var(--primary)]"
              />
            </div>
          </div>
        </div>

        <div className="card border-green-200 bg-[#f1f7ef]">
          <h3 className="font-bold mb-3">Results</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-[var(--muted-foreground)]">Peak Discharge (Q)</span>
              <span className="font-bold font-mono text-[var(--primary)]">{result.peakDischarge} m³/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--muted-foreground)]">Total Volume (1hr storm)</span>
              <span className="font-bold font-mono">{result.totalVolume} m³</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
