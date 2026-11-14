"use client";

import { useEffect, useRef } from "react";
import { subscribeProgress, type ProgressSnapshot } from "@/lib/progress";

/**
 * Runs `callback` on every progress change without re-rendering the
 * component. Use it to write styles or uniforms imperatively.
 */
export function useExperienceProgress(callback: (snapshot: ProgressSnapshot) => void) {
  const saved = useRef(callback);

  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => subscribeProgress((snapshot) => saved.current(snapshot)), []);
}
