"use client";

import { useMemo, useRef } from "react";
import { useExperienceProgress } from "@/hooks/useExperienceProgress";
import { generateCity, SPIRE_HEIGHT } from "@/lib/city/layout";

/**
 * Alternative for devices without WebGL: the same procedural city drawn as
 * a layered SVG elevation. Scroll moves the layers at different rates; with
 * reduced motion it stays still. All captions and the hand-off still work.
 */
export function CityFallback({ reducedMotion }: { reducedMotion: boolean }) {
  const layersRef = useRef<SVGSVGElement>(null);

  const layers = useMemo(() => {
    const { buildings } = generateCity(420);
    // Elevation seen from the south: three depth bands by distance.
    const bands: { x: number; w: number; h: number }[][] = [[], [], []];
    buildings.slice(3).forEach((b) => {
      if (Math.abs(b.x) > 330) return;
      const band = b.z > 60 ? 2 : b.z > -60 ? 1 : 0;
      bands[band].push({ x: b.x, w: b.w, h: b.h });
    });
    return bands;
  }, []);

  useExperienceProgress(({ scenes }) => {
    if (reducedMotion || !layersRef.current) return;
    // A slow push-in towards the spire stands in for the camera flight.
    layersRef.current.style.transform = `scale(${(1 + scenes.city * 0.7).toFixed(4)})`;
  });

  const fills = ["#1c2335", "#131827", "#0a0d15"];
  const band = (depth: number) => (
    <g key={depth}>
      {layers[depth].map((b, i) => (
        <rect key={i} x={b.x - b.w / 2} y={-b.h} width={b.w} height={b.h} fill={fills[depth]} />
      ))}
    </g>
  );

  return (
    <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(to_top,#1a2236_0%,#0d111b_50%,#04050a_100%)]" aria-hidden>
      <svg
        ref={layersRef}
        viewBox="-300 -262 600 274"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 size-full origin-[50%_80%] will-change-transform"
      >
        {band(0)}
        <g>
          <rect x={-14} y={-120} width={28} height={120} fill="#242c40" />
          <rect x={-10.5} y={-192} width={21} height={72} fill="#242c40" />
          <rect x={-6.5} y={-SPIRE_HEIGHT} width={13} height={SPIRE_HEIGHT - 192} fill="#242c40" />
          <rect x={-14} y={-120} width={0.8} height={120} fill="#fcee0a" />
          <rect x={13.2} y={-120} width={0.8} height={120} fill="#fcee0a" />
          <rect x={-10.5} y={-192} width={0.6} height={72} fill="#fcee0a" />
          <rect x={9.9} y={-192} width={0.6} height={72} fill="#fcee0a" />
          <circle cx={0} cy={-SPIRE_HEIGHT - 6} r={1.6} fill="#ff245e" />
        </g>
        {band(1)}
        {band(2)}
        <rect x={-300} y={0} width={600} height={12} fill="#07090d" />
      </svg>
      <p className="ns-label absolute right-[var(--hud-pad)] top-[calc(var(--hud-h)+var(--hud-pad)*2)] text-ns-gray">
        Schematic view — 3D unavailable on this device
      </p>
    </div>
  );
}
