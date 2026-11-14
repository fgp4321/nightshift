import * as THREE from "three";

/**
 * Uniforms shared by every city material (by reference), so one write per
 * frame updates the whole scene. Module-level on purpose: the frame loop
 * mutates them outside React.
 */
export const FOG_COLOR = new THREE.Color(0.05, 0.065, 0.105);

export const cityUniforms = {
  uTime: { value: 0 },
  uFogColor: { value: FOG_COLOR },
  uFogDensity: { value: 0.003 },
  uCamPos: { value: new THREE.Vector3() },
  /** 0–1: how awake the access terminal is. */
  uHolo: { value: 0 },
};

/** Live camera readout shown in the HUD overlay. Real values, not decoration. */
export const cityTelemetry = { x: 0, y: 0, z: 0 };
