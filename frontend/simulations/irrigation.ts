export interface Sprinkler {
  id: string;
  x: number; // 0-100 (percentage of field)
  y: number; // 0-100
  radius: number; // meters
  flowRate: number; // L/min
}

export interface IrrigationParams {
  fieldWidth: number; // meters
  fieldHeight: number; // meters
  sprinklers: Sprinkler[];
  pressure: number; // kPa
  applicationRate: number; // mm/hr target
}

export interface IrrigationResult {
  uniformityCoefficient: number; // Christiansen's CU (%)
  distributionUniformity: number; // DU (%)
  coveragePercent: number;
  totalFlowRate: number; // L/min
  waterGrid: number[][]; // 2D grid of water depth values
  overIrrigated: number; // % area over-irrigated
  underIrrigated: number; // % area under-irrigated
}

const GRID_SIZE = 50;

export function calculateWaterDistribution(params: IrrigationParams): IrrigationResult {
  const { fieldWidth, fieldHeight, sprinklers, pressure } = params;
  const grid: number[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

  const pressureFactor = Math.sqrt(pressure / 200);

  for (const sprinkler of sprinklers) {
    const sx = (sprinkler.x / 100) * GRID_SIZE;
    const sy = (sprinkler.y / 100) * GRID_SIZE;
    const radiusCells = (sprinkler.radius * pressureFactor / Math.max(fieldWidth, fieldHeight)) * GRID_SIZE;

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const dist = Math.sqrt((i - sx) ** 2 + (j - sy) ** 2);
        if (dist <= radiusCells) {
          const normalizedDist = dist / radiusCells;
          const intensity = Math.max(0, 1 - normalizedDist * normalizedDist) * sprinkler.flowRate * pressureFactor;
          grid[i][j] += intensity;
        }
      }
    }
  }

  const allValues = grid.flat();
  const nonZeroValues = allValues.filter((v) => v > 0);

  if (nonZeroValues.length === 0) {
    return {
      uniformityCoefficient: 0,
      distributionUniformity: 0,
      coveragePercent: 0,
      totalFlowRate: 0,
      waterGrid: grid,
      overIrrigated: 0,
      underIrrigated: 100,
    };
  }

  const mean = nonZeroValues.reduce((a, b) => a + b, 0) / nonZeroValues.length;
  const deviations = nonZeroValues.map((v) => Math.abs(v - mean));
  const meanDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
  const cu = (1 - meanDeviation / mean) * 100;

  const sorted = [...nonZeroValues].sort((a, b) => a - b);
  const lowerQuarter = sorted.slice(0, Math.ceil(sorted.length * 0.25));
  const lowerQuarterMean = lowerQuarter.reduce((a, b) => a + b, 0) / lowerQuarter.length;
  const du = (lowerQuarterMean / mean) * 100;

  const coveragePercent = (nonZeroValues.length / allValues.length) * 100;
  const totalFlowRate = sprinklers.reduce((sum, s) => sum + s.flowRate, 0);
  const overIrrigated = (nonZeroValues.filter((v) => v > mean * 1.3).length / allValues.length) * 100;
  const underIrrigated = ((allValues.length - nonZeroValues.length + nonZeroValues.filter((v) => v < mean * 0.7).length) / allValues.length) * 100;

  return {
    uniformityCoefficient: Math.round(cu * 10) / 10,
    distributionUniformity: Math.round(du * 10) / 10,
    coveragePercent: Math.round(coveragePercent * 10) / 10,
    totalFlowRate: Math.round(totalFlowRate * 10) / 10,
    waterGrid: grid,
    overIrrigated: Math.round(overIrrigated * 10) / 10,
    underIrrigated: Math.round(underIrrigated * 10) / 10,
  };
}

export function createDefaultSprinkler(x: number, y: number): Sprinkler {
  return {
    id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    x,
    y,
    radius: 12,
    flowRate: 15,
  };
}
