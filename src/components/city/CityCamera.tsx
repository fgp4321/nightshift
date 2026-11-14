"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { FogExp2, PerspectiveCamera } from "three";
import {
  createCameraRig,
  createCameraTimeline,
  stationFor,
  type CameraRig,
} from "@/animations/cityAnimations";
import { cityTelemetry, cityUniforms } from "@/lib/city/uniforms";
import { progress, subscribeProgress } from "@/lib/progress";

interface Rig {
  state: CameraRig;
  timeline: gsap.core.Timeline;
  /** Smoothed scene progress. */
  eased: number;
  pointerX: number;
  pointerY: number;
  parallaxX: number;
  parallaxY: number;
}

/**
 * Scroll-driven cinematic camera. A paused GSAP timeline holds the flight
 * path; each frame it is set to the (lightly smoothed) scene progress and
 * the result is applied to the camera, plus a little mouse parallax.
 * Reduced motion: no flight and no parallax — it cuts between the five shots.
 */
export function CityCamera({ reducedMotion }: { reducedMotion: boolean }) {
  const rigRef = useRef<Rig | null>(null);
  const invalidate = useThree((three) => three.invalidate);

  useEffect(() => {
    const state = createCameraRig();
    const rig: Rig = {
      state,
      timeline: createCameraTimeline(state),
      eased: progress.scenes.city,
      pointerX: 0,
      pointerY: 0,
      parallaxX: 0,
      parallaxY: 0,
    };
    rigRef.current = rig;

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      rig.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      rig.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    if (!reducedMotion) window.addEventListener("pointermove", onPointer, { passive: true });
    // In demand mode (reduced motion) a frame is only drawn when progress changes.
    const unsubscribe = subscribeProgress(() => invalidate());

    return () => {
      window.removeEventListener("pointermove", onPointer);
      unsubscribe();
      rig.timeline.kill();
      rigRef.current = null;
    };
  }, [reducedMotion, invalidate]);

  useFrame((three, delta) => {
    const rig = rigRef.current;
    if (!rig) return;
    const camera = three.camera as PerspectiveCamera;
    const target = progress.scenes.city;

    if (reducedMotion) {
      rig.eased = stationFor(target);
    } else {
      rig.eased += (target - rig.eased) * (1 - Math.exp(-delta * 5));
      if (Math.abs(target - rig.eased) < 0.00005) rig.eased = target;
    }
    rig.timeline.progress(rig.eased);
    const s = rig.state;

    // Parallax eases off as the camera closes in on the terminal.
    const strength = reducedMotion ? 0 : 1 - s.holo * 0.85;
    rig.parallaxX += (rig.pointerX * strength - rig.parallaxX) * (1 - Math.exp(-delta * 3));
    rig.parallaxY += (rig.pointerY * strength - rig.parallaxY) * (1 - Math.exp(-delta * 3));
    const reach = Math.min(6, s.py * 0.05 + 0.6);

    camera.position.set(s.px + rig.parallaxX * reach, s.py - rig.parallaxY * reach * 0.5, s.pz);
    camera.lookAt(s.tx, s.ty, s.tz);

    // Portrait screens need a wider lens to keep the skyline in frame.
    const fov = s.fov * (camera.aspect < 1 ? 1.32 : 1);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    cityUniforms.uCamPos.value.copy(camera.position);
    cityUniforms.uFogDensity.value = s.fog;
    cityUniforms.uHolo.value = s.holo;
    const fog = three.scene.fog as FogExp2 | null;
    if (fog) fog.density = s.fog;

    cityTelemetry.x = camera.position.x;
    cityTelemetry.y = camera.position.y;
    cityTelemetry.z = camera.position.z;
  });

  return null;
}
