export type QualityTier = "high" | "medium" | "low";

export interface DeviceCapabilities {
  webgl: boolean;
  reducedMotion: boolean;
  /** Primary input is touch: no hover, no custom cursor. */
  coarsePointer: boolean;
  tier: QualityTier;
}

export const SERVER_CAPABILITIES: DeviceCapabilities = {
  webgl: true,
  reducedMotion: false,
  coarsePointer: false,
  tier: "medium",
};

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
    // Release the probe context straight away; browsers cap live contexts.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function detectTier(coarsePointer: boolean): QualityTier {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const narrow = Math.min(window.innerWidth, window.innerHeight) < 600;

  if (cores <= 4 && memory <= 2) return "low";
  if (coarsePointer && narrow) return cores >= 8 && memory >= 6 ? "medium" : "low";
  if (coarsePointer || cores < 8 || memory < 8) return "medium";
  return "high";
}

/** Client-only. Heuristic starting point; runtime FPS may demote it later. */
export function detectCapabilities(): DeviceCapabilities {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  return {
    webgl: detectWebGL(),
    reducedMotion,
    coarsePointer,
    tier: detectTier(coarsePointer),
  };
}
