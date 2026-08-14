"use client";
import Navbar from "@/frontend/components/layout/Navbar";
import RunoffSimulator from "@/frontend/components/simulations/RunoffSimulator";
import PageHeader from "@/frontend/components/layout/PageHeader";
import { Droplets } from "lucide-react";

export default function RunoffPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-container">
        <PageHeader eyebrow="Hydrology model" title="Runoff calculator" description="Explore how land use, rainfall intensity, and catchment size influence peak surface runoff." icon={Droplets} meta="RATIONAL METHOD  •  Q = CiA / 360" />
        <RunoffSimulator />
      </main>
    </div>
  );
}
