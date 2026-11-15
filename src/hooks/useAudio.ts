"use client";

import { useCallback, useEffect, useRef } from "react";
import { SCENE_STATION } from "@/data/stations";
import {
  setAmbienceEnabled,
  setAmbienceMuted,
  setAmbienceStation,
  setAmbienceVolume,
  playCue,
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

  const stationAuto = useExperienceStore((s) => s.stationAuto);

  /** A manual choice; it stops the ambience following the current world. */
  const changeStation = useCallback((id: string) => {
    store().setStationAuto(false);
    store().setStation(id);
    setAmbienceStation(id);
  }, []);

  const followCity = useCallback(() => {
    const id = SCENE_STATION[store().currentScene];
    store().setStationAuto(true);
    store().setStation(id);
    setAmbienceStation(id);
  }, []);

  return { enabled, volume, muted, station, stationAuto, toggle, changeVolume, toggleMute, changeStation, followCity };
}

/**
 * Keeps the ambience in step with the world on screen and marks each
 * change of act with a low thud. Mount once, in ExperienceController.
 */
export function useSceneAudio() {
  const currentScene = useExperienceStore((s) => s.currentScene);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
    } else if (!store().isTransitioning) {
      playCue("thud");
    }
    if (!store().stationAuto) return;
    const id = SCENE_STATION[currentScene];
    store().setStation(id);
    setAmbienceStation(id);
  }, [currentScene]);
}
