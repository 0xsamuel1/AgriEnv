"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ControlPanel, ControlSection, Insight, Metric, RangeControl, Visualization } from "./SimulationWorkbench";
import {
  Sprinkler,
  IrrigationParams,
  calculateWaterDistribution,
  createDefaultSprinkler,
} from "@/frontend/simulations/irrigation";

export default function IrrigationDesigner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draggedRef = useRef(false);
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
    ctx.fillStyle = "#234e37";
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
          ctx.fillStyle = `rgba(135, 220, 221, ${0.1 + val * 0.65})`;
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
      const sr = (s.radius * Math.sqrt(params.pressure / 200) / params.fieldWidth) * w;

      // Spray radius circle
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(181, 232, 210, 0.6)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sprinkler dot
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#729d50";
      ctx.fill();
      ctx.fillStyle = "#edf5dc";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(sprinklers.indexOf(s) + 1).padStart(2, "0"), sx, sy - 13);
    }
  }, [sprinklers, params, result]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeCanvas = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const size = Math.min(rect.width, 420 * params.fieldWidth / params.fieldHeight);
      canvas.width = size;
      canvas.height = size * params.fieldHeight / params.fieldWidth;
      drawField();
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [drawField, params.fieldWidth, params.fieldHeight]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    if (dragging) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (sprinklers.some((s) => Math.hypot(s.x - x, s.y - y) < 5)) return;
    setSprinklers((prev) => [...prev, createDefaultSprinkler(x, y)]);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggedRef.current = false;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;

    const hit = sprinklers.find((s) => Math.hypot(s.x - mx, s.y - my) < 5);
    if (hit) {
      draggedRef.current = true;
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
    <div className="sim-layout">
      <ControlPanel onReset={() => { setSprinklers([createDefaultSprinkler(25, 25), createDefaultSprinkler(75, 25), createDefaultSprinkler(25, 75), createDefaultSprinkler(75, 75)]); setParams({ fieldWidth: 100, fieldHeight: 100, sprinklers: [], pressure: 200, applicationRate: 10 }); }}>
        <ControlSection number="01" title="Field & pressure">
          <RangeControl label="Operating pressure" value={params.pressure} unit="kPa" min={50} max={500} step={10} onChange={pressure => setParams(p => ({ ...p, pressure }))} />
          <RangeControl label="Field width" value={params.fieldWidth} unit="m" min={20} max={200} step={10} onChange={fieldWidth => setParams(p => ({ ...p, fieldWidth }))} />
          <p className="mt-3 text-[10px] text-[#8a947f]">Field length: {params.fieldHeight} m</p>
        </ControlSection>
        <ControlSection number="02" title={`Sprinkler network · ${sprinklers.length}`}>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {sprinklers.length === 0 && <p className="rounded-lg border border-dashed border-[#dfe5d7] p-4 text-xs leading-6 text-[#88917e]">Your field is clear. Tap the map or add a sprinkler to start designing.</p>}
            {sprinklers.map((s, i) => <div key={s.id} className="flex items-center gap-3 rounded-lg border border-[#e9eddf] bg-[#fafbf7] px-3 py-2.5"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#e8efe0] font-mono text-[10px] text-[#678247]">{String(i + 1).padStart(2, "0")}</span><div className="flex-1"><p className="text-[11px] text-[#4d6045]">Sprinkler {i + 1}</p><p className="mt-0.5 font-mono text-[9px] text-[#929d88]">X {s.x.toFixed(0)}% · Y {s.y.toFixed(0)}%</p></div><button type="button" aria-label={`Remove sprinkler ${i + 1}`} onClick={() => setSprinklers(prev => prev.filter(sp => sp.id !== s.id))} className="rounded-md p-2 text-[#97a08e] hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button></div>)}
          </div>
          <button type="button" onClick={() => setSprinklers(prev => [...prev, createDefaultSprinkler(50, 50)])} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#b4c79d] bg-[#f2f6e9] text-xs font-medium text-[#57723d]"><Plus size={14} /> Add sprinkler</button>
        </ControlSection>
      </ControlPanel>
      <div className="min-w-0">
        <div className="sim-metrics">
          <Metric primary label="Uniformity · CU" value={result.uniformityCoefficient} unit="%" note="Target: 85% or higher" />
          <Metric label="Field coverage" value={result.coveragePercent} unit="%" note="Area receiving water" />
          <Metric label="Total flow" value={result.totalFlowRate} unit="L/min" note={`${sprinklers.length} sprinklers in your network`} />
        </div>
        <Visualization title="Your irrigation layout" subtitle="Tap to place a sprinkler. Drag to reposition." action={<button type="button" onClick={() => setSprinklers([])} className="flex items-center gap-1.5 rounded-md border border-white/20 px-2.5 py-1.5 text-[10px] text-[#c6d3c1] hover:bg-white/10"><Trash2 size={11} /> Clear field</button>} legend={<span className="flex items-center gap-2">Less water<span className="inline-block h-1.5 w-20 rounded-full bg-gradient-to-r from-[#315b37] via-[#3c918a] to-[#a4dce1]" />More water</span>}>
          <canvas ref={canvasRef} className="mx-auto touch-none cursor-crosshair" aria-label="Interactive sprinkler layout. Tap to add or drag to move sprinklers." onClick={handleCanvasClick} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={() => { draggedRef.current = false; setDragging(null); }} />
        </Visualization>
        <dl className="sim-detail-grid"><div><dt>Distribution uniformity</dt><dd>{result.distributionUniformity}% DU</dd></div><div><dt>Field dimensions</dt><dd>{params.fieldWidth} × {params.fieldHeight} m</dd></div><div><dt>CU assessment</dt><dd><span style={{ color: cuColor }}>●</span> {result.uniformityCoefficient >= 85 ? "On target" : "Needs adjustment"}</dd></div></dl>
        <Insight title="Good coverage starts with good placement">Overlap the spray areas to distribute water more evenly. CU measures overall uniformity; DU focuses on the driest quarter of the field.</Insight>
      </div>
    </div>
  );
}
