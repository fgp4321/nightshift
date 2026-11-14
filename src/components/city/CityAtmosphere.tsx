"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createRain, createSky, disposeObject } from "@/lib/city/builders";
import { cityUniforms, FOG_COLOR } from "@/lib/city/uniforms";

/** Sky, fog, rain and the shared clock that animates every city shader. */
export function CityAtmosphere({ particles, animate }: { particles: number; animate: boolean }) {
  const atmosphere = useMemo(() => {
    const root = new THREE.Group();
    root.add(createSky(), createRain(particles));
    return root;
  }, [particles]);

  useEffect(() => () => disposeObject(atmosphere), [atmosphere]);

  useFrame((_, delta) => {
    // Clamp so a background tab does not fast-forward the city on return.
    if (animate) cityUniforms.uTime.value += Math.min(delta, 0.1);
  });

  return (
    <>
      <color attach="background" args={[FOG_COLOR]} />
      <fogExp2 attach="fog" args={[FOG_COLOR, cityUniforms.uFogDensity.value]} />
      <primitive object={atmosphere} />
    </>
  );
}
