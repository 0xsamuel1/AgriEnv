export interface RunoffParams {
  runoffCoefficient: number; // C (0-1)
  rainfallIntensity: number; // i (mm/hr)
  catchmentArea: number; // A (hectares)
}

export interface RunoffResult {
  peakDischarge: number; // Q (m³/s)
  totalVolume: number; // m³
  formulaDisplay: string;
}

export const LAND_USE_COEFFICIENTS: Record<string, { label: string; C: number; color: string }> = {
  forest: { label: "Dense Forest", C: 0.1, color: "#166534" },
  grassland: { label: "Grassland/Pasture", C: 0.25, color: "#65a30d" },
  cropland: { label: "Cultivated Cropland", C: 0.4, color: "#ca8a04" },
  suburban: { label: "Suburban Area", C: 0.6, color: "#ea580c" },
  urban: { label: "Urban/Paved", C: 0.85, color: "#dc2626" },
};

export function calculateRunoff(params: RunoffParams): RunoffResult {
  const { runoffCoefficient: C, rainfallIntensity: i, catchmentArea: A } = params;
  // Q = C * i * A / 360 (when i in mm/hr, A in hectares, Q in m³/s)
  const peakDischarge = (C * i * A) / 360;
  // Total volume for 1-hour storm
  const totalVolume = (C * (i / 1000) * A * 10000); // m³

  return {
    peakDischarge: Math.round(peakDischarge * 1000) / 1000,
    totalVolume: Math.round(totalVolume * 100) / 100,
    formulaDisplay: `Q = (${C.toFixed(2)} × ${i.toFixed(1)} × ${A.toFixed(1)}) / 360 = ${(peakDischarge).toFixed(3)} m³/s`,
  };
}

export function getRunoffVisualizationData(params: RunoffParams) {
  const result = calculateRunoff(params);
  const maxQ = calculateRunoff({ runoffCoefficient: 0.95, rainfallIntensity: 200, catchmentArea: params.catchmentArea }).peakDischarge;
  return {
    ...result,
    intensity: Math.min(result.peakDischarge / maxQ, 1),
    rainDrops: Math.floor(params.rainfallIntensity / 5),
    waterLevel: Math.min(result.peakDischarge / (maxQ * 0.5), 1),
  };
}
