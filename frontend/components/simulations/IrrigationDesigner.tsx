"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, Trash2, Info } from "lucide-react";
import {
  Sprinkler,
  IrrigationParams,
  calculateWaterDistribution,
  createDefaultSprinkler,
} from "@/frontend/simulations/irrigation";

export default function IrrigationDesigner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sprinklers, setSprinklers] = useState<Sprinkler[]>([
    createDefaultSprinkler(25, 25),
    createDefaultSprinkler(75, 25),
    createDefaultSprinkler(25, 75),
    createDefaultSprinkler(75, 75),
  ]);
  const [params, setParams] = useState<IrrigationParams>({
    fieldWidth: 100,
    fieldHeight: 100,
    sprinklers: [],
    pressure: 200,
    applicationRate: 10,
  });
  const [dragging, setDragging] = useState<string | null>(null);

  const fullParams = { ...params, sprinklers };
  const result = calculateWaterDistribution(fullParams);

  const drawField = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Field background
    ctx.fillStyle = "#2d5a1e";
    ctx.fillRect(0, 0, w, h);

    // Water distribution heatmap
    const grid = result.waterGrid;
    const gridSize = grid.length;
    const cellW = w / gridSize;
    const cellH = h / gridSize;
    const maxVal = Math.max(...grid.flat(), 1);

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const val = grid[i][j] / maxVal;
        if (val > 0) {
          const blue = Math.floor(100 + val * 155);
          const alpha = 0.2 + val * 0.6;
          ctx.fillStyle = `rgba(30, ${Math.floor(80 + val * 80)}, ${blue}, ${alpha})`;
          ctx.fillRect(i * cellW, j * cellH, cellW + 1, cellH + 1);
        }
      }
    }

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo((i / 10) * w, 0);
      ctx.lineTo((i / 10) * w, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (i / 10) * h);
      ctx.lineTo(w, (i / 10) * h);
      ctx.stroke();
    }

    // Sprinklers
    for (const s of sprinklers) {
      const sx = (s.x / 100) * w;
      const sy = (s.y / 100) * h;
      const sr = (s.radius * Math.sqrt(params.pressure / 200) / Math.max(params.fieldWidth, params.fieldHeight)) * w;

      // Spray radius circle
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(100, 200, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sprinkler dot
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#3b82f6";
      ctx.fill();
    }
  }, [sprinklers, params, result]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeCanvas = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const size = Math.min(rect.width, 500);
      canvas.width = size;
      canvas.height = size;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    drawField();
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [drawField]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragging) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (sprinklers.some((s) => Math.hypot(s.x - x, s.y - y) < 5)) return;
    setSprinklers((prev) => [...prev, createDefaultSprinkler(x, y)]);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;

    const hit = sprinklers.find((s) => Math.hypot(s.x - mx, s.y - my) < 5);
    if (hit) {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(hit.id);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setSprinklers((prev) => prev.map((s) => (s.id === dragging ? { ...s, x, y } : s)));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(null);
  };

  const cuColor = result.uniformityCoefficient >= 85 ? "#22c55e" : result.uniformityCoefficient >= 70 ? "#eab308" : "#ef4444";

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <div className="card p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-[var(--muted-foreground)]">Tap to place sprinklers. Drag to move.</span>
            <button
              onClick={() => setSprinklers([])}
              className="text-xs text-[var(--destructive)] hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear All
            </button>
          </div>
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="max-w-full touch-none rounded-xl cursor-crosshair"
              onClick={handleCanvasClick}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => setDragging(null)}
            />
          </div>
        </div>
        <div className="card mt-4 bg-[var(--muted)]">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm font-semibold">Uniformity Analysis</span>
          </div>
          <p className="text-sm">
            CU (Christiansen&apos;s) measures how evenly water is distributed. Target: CU &ge; 85% for crops. DU (Distribution Uniformity) focuses on the driest quarter.
          </p>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="card">
          <h3 className="font-bold mb-3">System Settings</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Pressure</span>
                <span className="font-mono font-bold">{params.pressure} kPa</span>
              </div>
              <input type="range" min={50} max={500} step={10} value={params.pressure}
                onChange={e => setParams(p => ({ ...p, pressure: +e.target.value }))}
                className="w-full accent-[var(--primary)]" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Field Width</span>
                <span className="font-mono font-bold">{params.fieldWidth} m</span>
              </div>
              <input type="range" min={20} max={200} step={10} value={params.fieldWidth}
                onChange={e => setParams(p => ({ ...p, fieldWidth: +e.target.value }))}
                className="w-full accent-[var(--primary)]" />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-3">Sprinklers ({sprinklers.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sprinklers.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 text-sm bg-[var(--muted)] p-2 rounded-lg">
                <span className="font-mono w-6">#{i + 1}</span>
                <span className="flex-1 text-xs text-[var(--muted-foreground)]">
                  ({s.x.toFixed(0)}%, {s.y.toFixed(0)}%)
                </span>
                <button onClick={() => setSprinklers(prev => prev.filter(sp => sp.id !== s.id))}
                  className="text-[var(--destructive)] hover:bg-[var(--border)] p-1 rounded">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setSprinklers(prev => [...prev, createDefaultSprinkler(50, 50)])}
            className="btn-secondary w-full mt-3 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Sprinkler
          </button>
        </div>

        <div className="card" style={{ borderColor: cuColor, borderWidth: 2 }}>
          <h3 className="font-bold mb-3">Results</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Uniformity (CU)</span>
              <span className="font-bold font-mono text-lg" style={{ color: cuColor }}>
                {result.uniformityCoefficient}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Distribution (DU)</span>
              <span className="font-bold font-mono">{result.distributionUniformity}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Coverage</span>
              <span className="font-bold font-mono">{result.coveragePercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Flow</span>
              <span className="font-bold font-mono">{result.totalFlowRate} L/min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
