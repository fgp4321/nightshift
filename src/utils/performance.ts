import type { QualityTier } from "./deviceCapabilities";

export interface QualityBudget {
  /** Upper bound for renderer pixel ratio. */
  maxPixelRatio: number;
  /** Instanced building count for the city. */
  buildings: number;
  /** Rain / dust particle count. */
  particles: number;
  /** Full-screen shader passes allowed. */
  postProcessing: boolean;
}

export const QUALITY_BUDGETS: Record<QualityTier, QualityBudget> = {
  high: { maxPixelRatio: 2, buildings: 1400, particles: 6000, postProcessing: true },
  medium: { maxPixelRatio: 1.5, buildings: 800, particles: 2500, postProcessing: true },
  low: { maxPixelRatio: 1, buildings: 380, particles: 900, postProcessing: false },
};

export function pixelRatioFor(tier: QualityTier): number {
  const device = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  return Math.min(device, QUALITY_BUDGETS[tier].maxPixelRatio);
}

/** Calls back with the tab's visibility; returns an unsubscribe function. */
export function onVisibilityChange(callback: (visible: boolean) => void): () => void {
  const handler = () => callback(document.visibilityState === "visible");
  document.addEventListener("visibilitychange", handler);
  return () => document.removeEventListener("visibilitychange", handler);
}
