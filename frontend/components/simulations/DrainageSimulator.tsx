"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Info } from "lucide-react";
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

    const cx = w / 2;
    const cy = h * 0.55;
    const scale = Math.min(w, h) * 0.08;

    // Background
    ctx.fillStyle = "rgba(139, 119, 101, 0.3)";
    ctx.fillRect(0, 0, w, h);

    // Draw channel cross-section
    ctx.strokeStyle = "#5a3e28";
    ctx.lineWidth = 3;
    ctx.fillStyle = "#8B7355";

    const halfW = (params.width / 2) * scale;

    if (params.channelType === "rectangular") {
      const chDepth = params.depth * scale * 1.5;
      // Banks
      ctx.fillStyle = "#8B7355";
      ctx.fillRect(0, cy - chDepth * 0.3, cx - halfW, chDepth * 1.5);
      ctx.fillRect(cx + halfW, cy - chDepth * 0.3, w - cx - halfW, chDepth * 1.5);
      // Channel walls
      ctx.beginPath();
      ctx.moveTo(cx - halfW, cy - chDepth * 0.3);
      ctx.lineTo(cx - halfW, cy + chDepth * 0.7);
      ctx.lineTo(cx + halfW, cy + chDepth * 0.7);
      ctx.lineTo(cx + halfW, cy - chDepth * 0.3);
      ctx.strokeStyle = "#5a3e28";
      ctx.lineWidth = 3;
      ctx.stroke();
      // Water
      const waterH = params.depth * scale;
      ctx.fillStyle = `rgba(30, 100, 200, 0.6)`;
      ctx.fillRect(cx - halfW, cy + chDepth * 0.7 - waterH, halfW * 2, waterH);
      // Animated flow
      for (let i = 0; i < result.velocity * 10; i++) {
        const fx = cx - halfW + ((i * 27 + time * result.velocity * 50) % (halfW * 2));
        const fy = cy + chDepth * 0.7 - waterH * Math.random();
        ctx.fillStyle = "rgba(100, 180, 255, 0.6)";
        ctx.beginPath();
        ctx.arc(fx, fy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (params.channelType === "trapezoidal") {
      const chDepth = params.depth * scale;
      const topHalfW = halfW + params.sideSlope * params.depth * scale;
      // Banks
      ctx.fillStyle = "#8B7355";
      ctx.beginPath();
      ctx.moveTo(0, cy - chDepth * 0.1);
      ctx.lineTo(cx - topHalfW, cy - chDepth * 0.1);
      ctx.lineTo(cx - halfW, cy + chDepth);
      ctx.lineTo(0, cy + chDepth * 1.3);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w, cy - chDepth * 0.1);
      ctx.lineTo(cx + topHalfW, cy - chDepth * 0.1);
      ctx.lineTo(cx + halfW, cy + chDepth);
      ctx.lineTo(w, cy + chDepth * 1.3);
      ctx.closePath();
      ctx.fill();
      // Channel outline
      ctx.beginPath();
      ctx.moveTo(cx - topHalfW, cy - chDepth * 0.1);
      ctx.lineTo(cx - halfW, cy + chDepth);
      ctx.lineTo(cx + halfW, cy + chDepth);
      ctx.lineTo(cx + topHalfW, cy - chDepth * 0.1);
      ctx.strokeStyle = "#5a3e28";
      ctx.lineWidth = 3;
      ctx.stroke();
      // Water
      ctx.fillStyle = "rgba(30, 100, 200, 0.6)";
      ctx.beginPath();
      ctx.moveTo(cx - topHalfW * 0.9, cy);
      ctx.lineTo(cx - halfW * 0.95, cy + chDepth * 0.95);
      ctx.lineTo(cx + halfW * 0.95, cy + chDepth * 0.95);
      ctx.lineTo(cx + topHalfW * 0.9, cy);
      ctx.closePath();
      ctx.fill();
      // Flow animation
      for (let i = 0; i < result.velocity * 12; i++) {
        const progress = ((i * 23 + time * result.velocity * 40) % 100) / 100;
        const fx = cx - topHalfW * 0.8 + progress * topHalfW * 1.6;
        const fy = cy + chDepth * (0.3 + Math.random() * 0.6);
        ctx.fillStyle = "rgba(100, 180, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(fx, fy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Circular
      const r = (params.diameter / 2) * scale * 1.5;
      // Pipe outline
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "#5a3e28";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = "rgba(80, 60, 40, 0.3)";
      ctx.fill();
      // Water level
      const waterRatio = Math.min(params.depth / params.diameter, 1);
      const waterY = cy + r - waterRatio * 2 * r;
      ctx.fillStyle = "rgba(30, 100, 200, 0.6)";
      ctx.beginPath();
      ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillRect(cx - r, waterY, r * 2, cy + r - waterY);
      ctx.restore();
      ctx.save();
      // Flow
      for (let i = 0; i < result.velocity * 8; i++) {
        const fx = cx - r + ((i * 19 + time * result.velocity * 40) % (r * 2));
        const fy = waterY + Math.random() * (cy + r - waterY);
        if (Math.hypot(fx - cx, fy - cy) < r) {
          ctx.fillStyle = "rgba(100, 180, 255, 0.5)";
          ctx.beginPath();
          ctx.arc(fx, fy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Dimension labels
    ctx.fillStyle = "var(--foreground)";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#e2e8f0";
    if (params.channelType !== "circular") {
      ctx.fillText(`b = ${params.width}m`, cx, cy + params.depth * scale * 1.5 + 20);
      ctx.fillText(`y = ${params.depth}m`, cx + halfW + 30, cy + params.depth * scale * 0.3);
    } else {
      ctx.fillText(`D = ${params.diameter}m`, cx, cy + (params.diameter / 2) * scale * 1.5 + 25);
    }

    animationRef.current = requestAnimationFrame(drawSimulation);
  }, [params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const resizeCanvas = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = Math.min(rect.width * 0.6, 400);
    };
    resizeCanvas();
    ctx.save();
    window.addEventListener("resize", resizeCanvas);
    animationRef.current = requestAnimationFrame(drawSimulation);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [drawSimulation]);

  const result = calculateDrainage(params);
  const regimeColor = result.flowRegime === "subcritical" ? "#22c55e" : result.flowRegime === "critical" ? "#eab308" : "#ef4444";

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <div className="card p-0 overflow-hidden">
          <canvas ref={canvasRef} className="w-full" />
        </div>
        <div className="card mt-4 bg-[#eef4ed]">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm font-semibold">Manning&apos;s Equation</span>
          </div>
          <code className="text-sm font-mono break-all">{result.formulaDisplay}</code>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="card">
          <h3 className="font-bold mb-3">Channel Type</h3>
          <div className="grid grid-cols-3 gap-2">
            {(["rectangular", "trapezoidal", "circular"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setParams(p => ({ ...p, channelType: type }))}
                className={`p-2.5 rounded-xl text-xs font-medium capitalize transition-all ${
                  params.channelType === type ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] hover:bg-[var(--border)]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-3">Channel Surface</h3>
          <select
            value={roughnessKey}
            onChange={(e) => { setRoughnessKey(e.target.value); setParams(p => ({ ...p, roughness: CHANNEL_ROUGHNESS[e.target.value].n })); }}
            className="input-field text-sm"
          >
            {Object.entries(CHANNEL_ROUGHNESS).map(([k, v]) => (
              <option key={k} value={k}>{v.label} (n={v.n})</option>
            ))}
          </select>
        </div>

        <div className="card">
          <h3 className="font-bold mb-3">Dimensions</h3>
          <div className="space-y-4">
            {params.channelType !== "circular" ? (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bottom Width (b)</span>
                    <span className="font-mono font-bold">{params.width} m</span>
                  </div>
                  <input type="range" min={0.5} max={10} step={0.5} value={params.width}
                    onChange={e => setParams(p => ({ ...p, width: +e.target.value }))}
                    className="w-full accent-[var(--primary)]" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Flow Depth (y)</span>
                    <span className="font-mono font-bold">{params.depth} m</span>
                  </div>
                  <input type="range" min={0.1} max={5} step={0.1} value={params.depth}
                    onChange={e => setParams(p => ({ ...p, depth: +e.target.value }))}
                    className="w-full accent-[var(--primary)]" />
                </div>
                {params.channelType === "trapezoidal" && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Side Slope (Z)</span>
                      <span className="font-mono font-bold">{params.sideSlope}:1</span>
                    </div>
                    <input type="range" min={0.5} max={4} step={0.5} value={params.sideSlope}
                      onChange={e => setParams(p => ({ ...p, sideSlope: +e.target.value }))}
                      className="w-full accent-[var(--primary)]" />
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Diameter (D)</span>
                    <span className="font-mono font-bold">{params.diameter} m</span>
                  </div>
                  <input type="range" min={0.3} max={3} step={0.1} value={params.diameter}
                    onChange={e => setParams(p => ({ ...p, diameter: +e.target.value }))}
                    className="w-full accent-[var(--primary)]" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Flow Depth</span>
                    <span className="font-mono font-bold">{params.depth} m</span>
                  </div>
                  <input type="range" min={0.1} max={params.diameter} step={0.1} value={Math.min(params.depth, params.diameter)}
                    onChange={e => setParams(p => ({ ...p, depth: +e.target.value }))}
                    className="w-full accent-[var(--primary)]" />
                </div>
              </>
            )}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Bed Slope (S)</span>
                <span className="font-mono font-bold">{params.bedSlope}</span>
              </div>
              <input type="range" min={0.0001} max={0.05} step={0.0001} value={params.bedSlope}
                onChange={e => setParams(p => ({ ...p, bedSlope: +e.target.value }))}
                className="w-full accent-[var(--primary)]" />
            </div>
          </div>
        </div>

        <div className="card" style={{ borderColor: regimeColor, borderWidth: 2 }}>
          <h3 className="font-bold mb-3">Results</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Flow Area (A)</span>
              <span className="font-mono font-bold">{result.flowArea} m²</span>
            </div>
            <div className="flex justify-between">
              <span>Wetted Perimeter (P)</span>
              <span className="font-mono font-bold">{result.wettedPerimeter} m</span>
            </div>
            <div className="flex justify-between">
              <span>Hydraulic Radius (R)</span>
              <span className="font-mono font-bold">{result.hydraulicRadius} m</span>
            </div>
            <div className="flex justify-between">
              <span>Velocity (V)</span>
              <span className="font-mono font-bold">{result.velocity} m/s</span>
            </div>
            <div className="flex justify-between">
              <span>Discharge (Q)</span>
              <span className="font-mono font-bold text-[var(--primary)] text-lg">{result.discharge} m³/s</span>
            </div>
            <hr className="border-[var(--border)]" />
            <div className="flex justify-between items-center">
              <span>Froude Number</span>
              <span className="font-mono font-bold">{result.froudeNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Flow Regime</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold text-white capitalize" style={{ backgroundColor: regimeColor }}>
                {result.flowRegime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
