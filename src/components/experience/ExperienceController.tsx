"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createMasterTimeline } from "@/animations/masterTimeline";
import { navigateToScene } from "@/animations/transitions";
import { isSceneId } from "@/data/scenes";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";
import { useLenis } from "@/hooks/useLenis";
import { useExperienceStore } from "@/store/experienceStore";
import { ProgressIndicator } from "./ProgressIndicator";
import { SceneManager } from "./SceneManager";

/**
 * Root of the experience. Owns the scroll engine, the master timeline and
 * deep-linking; renders the scenes and the persistent interface around them.
 */
export function ExperienceController() {
  const rootRef = useRef<HTMLDivElement>(null);
  const currentScene = useExperienceStore((s) => s.currentScene);
  const reducedMotion = useExperienceStore((s) => s.capabilities.reducedMotion);

  useDeviceCapabilities();
  useLenis(!reducedMotion);

  // Master timeline: created once, reverted on unmount.
  useEffect(() => {
    if (!rootRef.current) return;
    return createMasterTimeline(rootRef.current);
  }, []);

  // Session flag + deep link (/#os, /#underground …) on first load.
  useEffect(() => {
    useExperienceStore.getState().hydrateIntro();
    const hash = window.location.hash.slice(1);
    if (!isSceneId(hash)) return;
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      navigateToScene(hash, { immediate: true });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Keep the URL shareable without adding history entries.
  useEffect(() => {
    const url = currentScene === "city" ? window.location.pathname : `#${currentScene}`;
    window.history.replaceState(null, "", url);
  }, [currentScene]);

  return (
    <div ref={rootRef} data-scene={currentScene} className="relative">
      <a href="#experience" className="ns-skip-link ns-label">
        Skip to experience
      </a>
      <SceneManager />
      <ProgressIndicator />
    </div>
  );
}
