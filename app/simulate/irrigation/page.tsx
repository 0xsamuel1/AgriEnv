"use client";

import IrrigationDesigner from "@/frontend/components/simulations/IrrigationDesigner";
import SimulationWorkbench from "@/frontend/components/simulations/SimulationWorkbench";

export default function IrrigationPage() {
  return (
    <SimulationWorkbench tool="irrigation">
      <IrrigationDesigner />
    </SimulationWorkbench>
  );
}
