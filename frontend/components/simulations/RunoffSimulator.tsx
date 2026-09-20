"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Choice, ControlPanel, ControlSection, Formula, Insight, Metric, RangeControl, Visualization } from "./SimulationWorkbench";
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
    skyGrad.addColorStop(0, "#234c3b");
    skyGrad.addColorStop(1, "#456b54");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#d0dfb620";
    for (let x = 18; x < w; x += 24) for (let y = 18; y < h; y += 24) ctx.fillRect(x, y, 1, 1);

    // Rain drops
    ctx.strokeStyle = `rgba(166, 212, 214, ${0.3 + data.intensity * 0.5})`;
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
    const landColor = ({ forest: "#4e7043", grassland: "#839761", cropland: "#9a9a65", suburban: "#8d8b72", urban: "#7a8c85" } as Record<string, string>)[selectedLandUse];
    ctx.fillStyle = landColor;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.45);
    ctx.quadraticCurveTo(w * 0.3, h * 0.35, w * 0.5, h * 0.5);
    ctx.quadraticCurveTo(w * 0.7, h * 0.6, w, h * 0.55);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Contour lines give the catchment a readable layered terrain profile.
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = "#d5d6ad35";
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, h * .48 + i * 19);
      ctx.bezierCurveTo(w * .25, h * .32 + i * 19, w * .6, h * .68 + i * 19, w, h * .5 + i * 19);
      ctx.stroke();
    }
    ctx.restore();

    // Surface runoff streams
    const streamLevel = data.waterLevel;
    if (streamLevel > 0) {
      ctx.fillStyle = `rgba(117, 192, 199, ${0.5 + streamLevel * 0.4})`;
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
      ctx.fillStyle = `rgba(53, 131, 142, ${0.6 + streamLevel * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(w * 0.85, h * 0.75, outletSize, outletSize * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vegetation dots based on land use
    const vegDensity = 1 - params.runoffCoefficient;
    ctx.fillStyle = "#c0d49a";
    for (let i = 0; i < vegDensity * 60; i++) {
      const vx = (i * 47) % w;
      const vy = h * 0.4 + ((i * 71) % (h * 0.4));
      ctx.beginPath();
      ctx.arc(vx, vy, 2 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = "9px monospace";
    ctx.fillStyle = "#d4e6c1";
    ctx.fillText("CATCHMENT PROFILE", 15, 22);
    ctx.fillText(`${params.rainfallIntensity} mm/hr`, 15, 39);
    ctx.fillText("OUTLET →", w * .75, h * .91);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) animationRef.current = requestAnimationFrame(drawSimulation);
  }, [params, selectedLandUse]);

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

  const result = calculateRunoff(params);

  return (
    <div className="sim-layout">
      <ControlPanel onReset={() => { setSelectedLandUse("cropland"); setParams({ runoffCoefficient: 0.4, rainfallIntensity: 50, catchmentArea: 100 }); }}>
        <ControlSection number="01" title="Catchment surface">
          {Object.entries(LAND_USE_COEFFICIENTS).map(([key, val]) => <Choice key={key} selected={selectedLandUse === key} onClick={() => { setSelectedLandUse(key); setParams(p => ({ ...p, runoffCoefficient: val.C })); }} label={val.label} detail={`C ${val.C.toFixed(2)}`} color={val.color} />)}
        </ControlSection>
        <ControlSection number="02" title="Rainfall & catchment">
          <RangeControl label="Rainfall intensity" value={params.rainfallIntensity} unit="mm/hr" min={5} max={200} step={5} onChange={rainfallIntensity => setParams(p => ({ ...p, rainfallIntensity }))} />
          <RangeControl label="Catchment area" value={params.catchmentArea} unit="ha" min={10} max={500} step={10} onChange={catchmentArea => setParams(p => ({ ...p, catchmentArea }))} />
        </ControlSection>
        <div className="mt-6 rounded-lg bg-[#f5f7ef] p-3 text-[10px] leading-5 text-[#839077]">Select a surface, then adjust the rainfall to explore your catchment’s response.</div>
      </ControlPanel>
      <div className="min-w-0">
        <div className="sim-metrics">
          <Metric primary label="Peak discharge" value={result.peakDischarge} unit="m³/s" note="Water leaving the catchment" />
          <Metric label="Runoff volume" value={result.totalVolume} unit="m³" note="For a one-hour storm" />
          <Metric label="Runoff coefficient" value={params.runoffCoefficient.toFixed(2)} note={LAND_USE_COEFFICIENTS[selectedLandUse].label} />
        </div>
        <Visualization title="Catchment response" subtitle="Rainfall → surface flow → collection" legend={<span>● Rainfall <span className="mx-3 text-[#9dbe83]">● Land cover</span><span className="text-[#96cbe3]">● Surface runoff</span></span>}>
          <canvas ref={canvasRef} className="w-full" role="img" aria-label={`Animated catchment showing ${params.rainfallIntensity} millimetres per hour of rainfall and ${result.peakDischarge} cubic metres per second of peak runoff`} />
        </Visualization>
        <Formula name="Rational method · Q = CiA / 360">{result.formulaDisplay}</Formula>
        <Insight title="The surface makes a difference">Compare forest and paved land under the same rainfall. A higher runoff coefficient sends more water into surface flow.</Insight>
      </div>
    </div>
  );
}
