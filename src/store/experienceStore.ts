import { create } from "zustand";
import type { SceneId } from "@/data/scenes";
import { SERVER_CAPABILITIES, type DeviceCapabilities } from "@/utils/deviceCapabilities";

const INTRO_KEY = "nightshift:intro-complete";

/**
 * Discrete experience state. Per-frame scroll progress deliberately lives in
 * `lib/progress.ts` instead, so scrolling never triggers React re-renders.
 */
interface ExperienceState {
  currentScene: SceneId;
  introComplete: boolean;
  audioEnabled: boolean;
  /** 0–1 master volume for the ambience. */
  volume: number;
  isTransitioning: boolean;
  menuOpen: boolean;
  capabilities: DeviceCapabilities;
  /** True when motion should be simplified (user preference or weak device). */
  reducedEffects: boolean;

  setScene: (scene: SceneId) => void;
  completeIntro: () => void;
  resetIntro: () => void;
  hydrateIntro: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setTransitioning: (value: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setCapabilities: (capabilities: DeviceCapabilities) => void;
}

function writeIntroFlag(done: boolean) {
  try {
    if (done) sessionStorage.setItem(INTRO_KEY, "1");
    else sessionStorage.removeItem(INTRO_KEY);
  } catch {
    /* storage unavailable (private mode / embedded): the intro simply replays */
  }
}

export const useExperienceStore = create<ExperienceState>((set, get) => ({
  currentScene: "city",
  introComplete: false,
  audioEnabled: false,
  volume: 0.6,
  isTransitioning: false,
  menuOpen: false,
  capabilities: SERVER_CAPABILITIES,
  reducedEffects: false,

  setScene: (scene) => {
    if (get().currentScene !== scene) set({ currentScene: scene });
  },
  completeIntro: () => {
    writeIntroFlag(true);
    set({ introComplete: true });
  },
  resetIntro: () => {
    writeIntroFlag(false);
    set({ introComplete: false });
  },
  hydrateIntro: () => {
    try {
      if (sessionStorage.getItem(INTRO_KEY) === "1") set({ introComplete: true });
    } catch {
      /* see writeIntroFlag */
    }
  },
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
  setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)) }),
  setTransitioning: (isTransitioning) => set({ isTransitioning }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setCapabilities: (capabilities) =>
    set({
      capabilities,
      reducedEffects: capabilities.reducedMotion || capabilities.tier === "low",
    }),
}));
