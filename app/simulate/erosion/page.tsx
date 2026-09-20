"use client";

import ErosionSimulator from "@/frontend/components/simulations/ErosionSimulator";
import SimulationWorkbench from "@/frontend/components/simulations/SimulationWorkbench";

export default function ErosionPage() {
  return (
    <SimulationWorkbench tool="erosion">
      <ErosionSimulator />
    </SimulationWorkbench>
  );
}
