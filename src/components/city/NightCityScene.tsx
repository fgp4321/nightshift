"use client";

import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useExperienceStore } from "@/store/experienceStore";
import { CityFallback } from "./CityFallback";
import { CityOverlays } from "./CityOverlays";

// Three.js and the whole 3D scene live in their own chunk, off the critical path.
const CityCanvas = dynamic(() => import("./CityCanvas"), {
  ssr: false,
  loading: () => (
    <p className="ns-label absolute inset-0 grid place-items-center text-ns-gray" role="status">
      Receiving district geometry…
    </p>
  ),
});

/** ACT 01 — the Corporate Sector in real-time 3D, with captions on top. */
export function NightCityScene({ active }: { active: boolean }) {
  const ready = useExperienceStore((s) => s.capabilitiesReady);
  const webgl = useExperienceStore((s) => s.capabilities.webgl);
  const reducedMotion = useExperienceStore((s) => s.capabilities.reducedMotion);
  const fallback = <CityFallback reducedMotion={reducedMotion} />;

  return (
    <div className="relative h-full bg-ns-black">
      {ready &&
        (webgl ? (
          <ErrorBoundary fallback={fallback}>
            <CityCanvas active={active} />
          </ErrorBoundary>
        ) : (
          fallback
        ))}
      <CityOverlays reducedMotion={reducedMotion} telemetry={ready && webgl} />
    </div>
  );
}
