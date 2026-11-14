"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  createBuildings,
  createGround,
  createHighways,
  createLetterSigns,
  createSigns,
  createSpireDetails,
  createTerminal,
  disposeObject,
} from "@/lib/city/builders";
import { generateCity } from "@/lib/city/layout";

/**
 * The built city: instanced buildings, streets, highways, signage, the
 * spire and the access terminal. Geometry is generated once per quality
 * budget and disposed on unmount.
 */
export function CityEnvironment({ buildings }: { buildings: number }) {
  const city = useMemo(() => {
    const layout = generateCity(buildings);
    const letters = createLetterSigns();
    const root = new THREE.Group();
    root.add(
      createGround(),
      createBuildings(layout),
      createHighways(layout),
      createSigns(layout),
      createSpireDetails(),
      createTerminal(),
      letters.group,
    );
    return { root, redraw: letters.redraw };
  }, [buildings]);

  useEffect(() => {
    let cancelled = false;
    // Repaint the lettered signs once the brand typeface is available.
    document.fonts
      .load('800 64px "Barlow Condensed"')
      .then(() => !cancelled && city.redraw())
      .catch(() => undefined);
    return () => {
      cancelled = true;
      disposeObject(city.root);
    };
  }, [city]);

  return <primitive object={city.root} />;
}
