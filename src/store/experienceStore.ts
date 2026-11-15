import { create } from "zustand";
import type { SceneId } from "@/data/scenes";
import { DEFAULT_STATION } from "@/data/stations";
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
  muted: boolean;
  /** Selected NIGHT RADIO ambience. */
  station: string;
  /** True while the ambience follows the current world automatically. */
  stationAuto: boolean;
  /** The boot overlay has started opening: what is behind it is now visible. */
  introLeaving: boolean;
  isTransitioning: boolean;
  menuOpen: boolean;
  /** NIGHT//OS is losing its link (drives the HUD status during the interference). */
  signalLost: boolean;
  capabilities: DeviceCapabilities;
  /** False until capabilities have been detected in the browser. */
  capabilitiesReady: boolean;
  /** True when motion should be simplified (user preference or weak device). */
  reducedEffects: boolean;

  setScene: (scene: SceneId) => void;
  completeIntro: () => void;
  resetIntro: () => void;
  hydrateIntro: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setStation: (station: string) => void;
  setStationAuto: (auto: boolean) => void;
  setIntroLeaving: (leaving: boolean) => void;
  setTransitioning: (value: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setSignalLost: (lost: boolean) => void;
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
  muted: false,
  station: DEFAULT_STATION,
  stationAuto: true,
  introLeaving: false,
  isTransitioning: false,
  menuOpen: false,
  signalLost: false,
  capabilities: SERVER_CAPABILITIES,
  capabilitiesReady: false,
  reducedEffects: false,

  setScene: (scene) => {
    if (get().currentScene !== scene) set({ currentScene: scene });
  },
  completeIntro: () => {
    writeIntroFlag(true);
    set({ introComplete: true, introLeaving: false });
  },
  resetIntro: () => {
    writeIntroFlag(false);
    set({ introComplete: false, introLeaving: false });
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
  setMuted: (muted) => set({ muted }),
  setStation: (station) => set({ station }),
  setStationAuto: (stationAuto) => set({ stationAuto }),
  setIntroLeaving: (introLeaving) => set({ introLeaving }),
  setTransitioning: (isTransitioning) => set({ isTransitioning }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setSignalLost: (signalLost) => {
    if (get().signalLost !== signalLost) set({ signalLost });
  },
  setCapabilities: (capabilities) =>
    set({
      capabilities,
      capabilitiesReady: true,
      reducedEffects: capabilities.reducedMotion || capabilities.tier === "low",
    }),
}));
