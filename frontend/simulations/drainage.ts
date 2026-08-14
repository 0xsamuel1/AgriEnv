export interface DrainageParams {
  channelType: "rectangular" | "trapezoidal" | "circular";
  width: number; // bottom width (m)
  depth: number; // flow depth (m)
  sideSlope: number; // Z (horizontal:vertical) for trapezoidal
  roughness: number; // Manning's n
  bedSlope: number; // S (m/m)
  diameter: number; // for circular channels (m)
}

export interface DrainageResult {
  flowArea: number; // A (m²)
  wettedPerimeter: number; // P (m)
  hydraulicRadius: number; // R (m)
  velocity: number; // V (m/s)
  discharge: number; // Q (m³/s)
  froudeNumber: number;
  flowRegime: "subcritical" | "critical" | "supercritical";
  formulaDisplay: string;
}

export const CHANNEL_ROUGHNESS: Record<string, { label: string; n: number }> = {
  concrete: { label: "Concrete (smooth)", n: 0.013 },
  brick: { label: "Brick/Masonry", n: 0.015 },
  earth: { label: "Earth (clean)", n: 0.022 },
  earthWeedy: { label: "Earth (weedy)", n: 0.035 },
  gravel: { label: "Gravel", n: 0.025 },
  naturalClean: { label: "Natural Stream (clean)", n: 0.030 },
  naturalBrush: { label: "Natural (with brush)", n: 0.050 },
};

export function calculateDrainage(params: DrainageParams): DrainageResult {
  const { channelType, width, depth, sideSlope, roughness, bedSlope, diameter } = params;

  let flowArea: number;
  let wettedPerimeter: number;

  switch (channelType) {
    case "rectangular":
      flowArea = width * depth;
      wettedPerimeter = width + 2 * depth;
      break;
    case "trapezoidal":
      flowArea = (width + sideSlope * depth) * depth;
      wettedPerimeter = width + 2 * depth * Math.sqrt(1 + sideSlope * sideSlope);
      break;
    case "circular": {
      const theta = 2 * Math.acos(1 - (2 * depth) / diameter);
      flowArea = (diameter * diameter / 8) * (theta - Math.sin(theta));
      wettedPerimeter = (diameter / 2) * theta;
      break;
    }
  }

  const hydraulicRadius = flowArea / wettedPerimeter;
  const velocity = (1 / roughness) * Math.pow(hydraulicRadius, 2 / 3) * Math.pow(bedSlope, 1 / 2);
  const discharge = flowArea * velocity;

  const topWidth =
    channelType === "rectangular"
      ? width
      : channelType === "trapezoidal"
      ? width + 2 * sideSlope * depth
      : diameter * Math.sin(Math.acos(1 - (2 * depth) / diameter));
  const hydraulicDepth = flowArea / topWidth;
  const froudeNumber = velocity / Math.sqrt(9.81 * hydraulicDepth);

  let flowRegime: DrainageResult["flowRegime"];
  if (froudeNumber < 0.95) flowRegime = "subcritical";
  else if (froudeNumber <= 1.05) flowRegime = "critical";
  else flowRegime = "supercritical";

  return {
    flowArea: Math.round(flowArea * 1000) / 1000,
    wettedPerimeter: Math.round(wettedPerimeter * 1000) / 1000,
    hydraulicRadius: Math.round(hydraulicRadius * 1000) / 1000,
    velocity: Math.round(velocity * 1000) / 1000,
    discharge: Math.round(discharge * 1000) / 1000,
    froudeNumber: Math.round(froudeNumber * 100) / 100,
    flowRegime,
    formulaDisplay: `Q = (1/${roughness.toFixed(3)}) × ${flowArea.toFixed(3)} × ${hydraulicRadius.toFixed(3)}^(2/3) × ${bedSlope.toFixed(4)}^(1/2) = ${discharge.toFixed(3)} m³/s`,
  };
}
