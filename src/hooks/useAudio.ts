"use client";

import { useCallback } from "react";
import {
  setAmbienceEnabled,
  setAmbienceMuted,
  setAmbienceStation,
  setAmbienceVolume,
} from "@/lib/audio/engine";
import { useExperienceStore } from "@/store/experienceStore";

const store = () => useExperienceStore.getState();

/** Audio state plus the only functions allowed to change it. */
export function useAudio() {
  const enabled = useExperienceStore((s) => s.audioEnabled);
  const volume = useExperienceStore((s) => s.volume);
  const muted = useExperienceStore((s) => s.muted);
  const station = useExperienceStore((s) => s.station);

  const toggle = useCallback(() => {
    const next = !store().audioEnabled;
    store().setAudioEnabled(next);
    void setAmbienceEnabled(next);
  }, []);

  const changeVolume = useCallback((value: number) => {
    store().setVolume(value);
    setAmbienceVolume(store().volume);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !store().muted;
    store().setMuted(next);
    setAmbienceMuted(next);
  }, []);

  const changeStation = useCallback((id: string) => {
    store().setStation(id);
    setAmbienceStation(id);
  }, []);

  return { enabled, volume, muted, station, toggle, changeVolume, toggleMute, changeStation };
}
