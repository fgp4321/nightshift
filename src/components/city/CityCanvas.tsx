"use client";

import { Canvas } from "@react-three/fiber";
import { useExperienceStore } from "@/store/experienceStore";
import { pixelRatioFor, QUALITY_BUDGETS } from "@/utils/performance";
import { CityAtmosphere } from "./CityAtmosphere";
import { CityCamera } from "./CityCamera";
import { CityEnvironment } from "./CityEnvironment";

/**
 * The WebGL view of ACT 01. Loaded lazily (see NightCityScene).
 * Rendering stops entirely while another act is on screen.
 */
export default function CityCanvas({ active }: { active: boolean }) {
  const tier = useExperienceStore((s) => s.capabilities.tier);
  const reducedMotion = useExperienceStore((s) => s.capabilities.reducedMotion);
  const budget = QUALITY_BUDGETS[tier];

  return (
    <Canvas
      className="!absolute inset-0"
      frameloop={!active ? "never" : reducedMotion ? "demand" : "always"}
      dpr={pixelRatioFor(tier)}
      gl={{ antialias: tier !== "low", powerPreference: "high-performance", alpha: false, stencil: false }}
      camera={{ fov: 38, near: 0.5, far: 3200, position: [-150, 185, 340] }}
      aria-hidden
    >
      <CityAtmosphere particles={budget.particles} animate={!reducedMotion} />
      <CityEnvironment buildings={budget.buildings} />
      <CityCamera reducedMotion={reducedMotion} />
    </Canvas>
  );
}
