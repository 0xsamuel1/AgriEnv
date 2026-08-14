"use client";
import Navbar from "@/frontend/components/layout/Navbar";
import IrrigationDesigner from "@/frontend/components/simulations/IrrigationDesigner";
import PageHeader from "@/frontend/components/layout/PageHeader";
import { Pipette } from "lucide-react";

export default function IrrigationPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-container">
        <PageHeader eyebrow="Water application model" title="Irrigation designer" description="Arrange a sprinkler network and measure how pressure and placement affect distribution across the field." icon={Pipette} meta="CHRISTIANSEN UNIFORMITY  •  DISTRIBUTION UNIFORMITY" />
        <IrrigationDesigner />
      </main>
    </div>
  );
}
