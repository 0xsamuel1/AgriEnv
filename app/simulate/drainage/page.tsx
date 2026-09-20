"use client";

import DrainageSimulator from "@/frontend/components/simulations/DrainageSimulator";
import SimulationWorkbench from "@/frontend/components/simulations/SimulationWorkbench";

export default function DrainagePage() {
  return (
    <SimulationWorkbench tool="drainage">
      <DrainageSimulator />
    </SimulationWorkbench>
  );
}
