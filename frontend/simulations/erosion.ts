export interface ErosionParams {
  rainfallFactor: number; // R (MJ·mm/ha·hr·yr)
  soilErodibility: number; // K
  slopeLength: number; // L (meters)
  slopeGradient: number; // S (degrees)
  coverFactor: number; // C (0-1)
  practiceFactor: number; // P (0-1)
}

export interface ErosionResult {
  soilLoss: number; // A (tonnes/ha/yr)
  lsFactor: number;
  severity: "low" | "moderate" | "high" | "severe";
  formulaDisplay: string;
}

export const SOIL_TYPES: Record<string, { label: string; K: number; color: string }> = {
  clay: { label: "Clay", K: 0.22, color: "#92400e" },
  clayLoam: { label: "Clay Loam", K: 0.30, color: "#a16207" },
  siltLoam: { label: "Silt Loam", K: 0.42, color: "#ca8a04" },
  sandyLoam: { label: "Sandy Loam", K: 0.27, color: "#d97706" },
  sand: { label: "Sand", K: 0.10, color: "#fbbf24" },
};

export const COVER_TYPES: Record<string, { label: string; C: number }> = {
  bare: { label: "Bare Soil", C: 1.0 },
  sparse: { label: "Sparse Vegetation", C: 0.5 },
  crops: { label: "Row Crops", C: 0.35 },
  cereals: { label: "Cereals/Grains", C: 0.15 },
  grass: { label: "Grass Cover", C: 0.05 },
  forest: { label: "Dense Forest", C: 0.01 },
};

export const PRACTICES: Record<string, { label: string; P: number }> = {
  none: { label: "No Practice (Downslope)", P: 1.0 },
  contour: { label: "Contour Farming", P: 0.6 },
  stripCrop: { label: "Strip Cropping", P: 0.35 },
  terracing: { label: "Terracing", P: 0.15 },
};

function calculateLS(slopeLength: number, slopeGradient: number): number {
  const slopePercent = Math.tan((slopeGradient * Math.PI) / 180) * 100;
  const m = slopePercent > 5 ? 0.5 : slopePercent > 3.5 ? 0.4 : slopePercent > 1 ? 0.3 : 0.2;
  const L = Math.pow(slopeLength / 22.13, m);
  const S =
    slopePercent < 9
      ? 10.8 * Math.sin((slopeGradient * Math.PI) / 180) + 0.03
      : 16.8 * Math.sin((slopeGradient * Math.PI) / 180) - 0.5;
  return L * S;
}

export function calculateErosion(params: ErosionParams): ErosionResult {
  const { rainfallFactor: R, soilErodibility: K, slopeLength, slopeGradient, coverFactor: C, practiceFactor: P } = params;
  const LS = calculateLS(slopeLength, slopeGradient);
  const soilLoss = R * K * LS * C * P;

  let severity: ErosionResult["severity"];
  if (soilLoss < 5) severity = "low";
  else if (soilLoss < 12) severity = "moderate";
  else if (soilLoss < 25) severity = "high";
  else severity = "severe";

  return {
    soilLoss: Math.round(soilLoss * 100) / 100,
    lsFactor: Math.round(LS * 100) / 100,
    severity,
    formulaDisplay: `A = ${R.toFixed(0)} × ${K.toFixed(2)} × ${LS.toFixed(2)} × ${C.toFixed(2)} × ${P.toFixed(2)} = ${soilLoss.toFixed(2)} t/ha/yr`,
  };
}

export function getSeverityColor(severity: ErosionResult["severity"]): string {
  const colors = { low: "#22c55e", moderate: "#eab308", high: "#f97316", severe: "#ef4444" };
  return colors[severity];
}
