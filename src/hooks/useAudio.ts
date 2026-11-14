"use client";

import { useCallback } from "react";
import { setAmbienceEnabled, setAmbienceVolume } from "@/lib/audio/engine";
import { useExperienceStore } from "@/store/experienceStore";

/** Audio state plus the only functions allowed to change it. */
export function useAudio() {
  const enabled = useExperienceStore((s) => s.audioEnabled);
  const volume = useExperienceStore((s) => s.volume);

  const toggle = useCallback(() => {
    const next = !useExperienceStore.getState().audioEnabled;
    useExperienceStore.getState().setAudioEnabled(next);
    void setAmbienceEnabled(next);
  }, []);

  const changeVolume = useCallback((value: number) => {
    useExperienceStore.getState().setVolume(value);
    setAmbienceVolume(useExperienceStore.getState().volume);
  }, []);

  return { enabled, volume, toggle, changeVolume };
}
