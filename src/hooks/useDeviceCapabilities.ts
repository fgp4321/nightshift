"use client";

import { useEffect } from "react";
import { useExperienceStore } from "@/store/experienceStore";
import { detectCapabilities } from "@/utils/deviceCapabilities";

/** Detects capabilities once on mount and tracks the reduced-motion setting. */
export function useDeviceCapabilities() {
  useEffect(() => {
    const { setCapabilities } = useExperienceStore.getState();
    setCapabilities(detectCapabilities());

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () =>
      setCapabilities({
        ...useExperienceStore.getState().capabilities,
        reducedMotion: query.matches,
      });
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
}
