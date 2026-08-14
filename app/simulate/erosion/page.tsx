"use client";
import Navbar from "@/frontend/components/layout/Navbar";
import ErosionSimulator from "@/frontend/components/simulations/ErosionSimulator";
import PageHeader from "@/frontend/components/layout/PageHeader";
import { Mountain } from "lucide-react";

export default function ErosionPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-container">
        <PageHeader eyebrow="Soil conservation model" title="Soil erosion simulator" description="Test how rainfall, soil, slope, crop cover, and conservation practice combine to determine annual soil loss." icon={Mountain} meta="UNIVERSAL SOIL LOSS EQUATION  •  A = R · K · LS · C · P" />
        <ErosionSimulator />
      </main>
    </div>
  );
}
