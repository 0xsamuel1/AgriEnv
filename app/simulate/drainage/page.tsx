"use client";
import Navbar from "@/frontend/components/layout/Navbar";
import DrainageSimulator from "@/frontend/components/simulations/DrainageSimulator";
import PageHeader from "@/frontend/components/layout/PageHeader";
import { Waves } from "lucide-react";

export default function DrainagePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-container">
        <PageHeader eyebrow="Open-channel model" title="Drainage designer" description="Shape a drainage channel and evaluate its capacity, velocity, hydraulic radius, and flow regime in real time." icon={Waves} meta="MANNING'S EQUATION  •  Q = 1/n · A · R²⁄³ · S½" />
        <DrainageSimulator />
      </main>
    </div>
  );
}
