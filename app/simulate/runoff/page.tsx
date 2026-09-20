"use client";

import RunoffSimulator from "@/frontend/components/simulations/RunoffSimulator";
import SimulationWorkbench from "@/frontend/components/simulations/SimulationWorkbench";

export default function RunoffPage() {
  return (
    <SimulationWorkbench tool="runoff">
      <RunoffSimulator />
    </SimulationWorkbench>
  );
}
