"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createMasterTimeline } from "@/animations/masterTimeline";
import { navigateToScene } from "@/animations/transitions";
import { isSceneId } from "@/data/scenes";
import { useSceneAudio } from "@/hooks/useAudio";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";
import { useLenis } from "@/hooks/useLenis";
import { useExperienceStore } from "@/store/experienceStore";
import { SystemBoot } from "@/components/boot/SystemBoot";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { ScreenTexture } from "@/components/ui/ScreenTexture";
import { TransitionCurtain } from "@/components/ui/TransitionCurtain";
import { GlobalNavigation } from "./GlobalNavigation";
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
  const introComplete = useExperienceStore((s) => s.introComplete);
  const menuOpen = useExperienceStore((s) => s.menuOpen);

  useDeviceCapabilities();
  useLenis(!reducedMotion);
  useSceneAudio();

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
    <div
      ref={rootRef}
      data-scene={currentScene}
      data-intro={introComplete ? "done" : "pending"}
      className="relative"
    >
      <a href="#experience" className="ns-skip-link ns-label">
        Skip to experience
      </a>

      {!introComplete && <SystemBoot />}

      <div inert={!introComplete}>
        <GlobalNavigation />
      </div>

      {/* Everything behind a modal layer (boot, menu) is inert. */}
      <div inert={!introComplete || menuOpen}>
        <SceneManager />
        <ProgressIndicator />
      </div>

      <ScreenTexture />
      <TransitionCurtain />
      <CustomCursor />
    </div>
  );
}
