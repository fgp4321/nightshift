"use client";

import { useAudio } from "@/hooks/useAudio";

/** Persistent sound toggle. Audio never starts without this being pressed. */
export function AudioController() {
  const { enabled, toggle } = useAudio();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Turn sound off" : "Turn sound on"}
      data-cursor={enabled ? "MUTE" : "SOUND"}
      className="ns-label group inline-flex h-11 items-center gap-2 border border-ns-line px-3 text-ns-white transition-colors duration-200 hover:border-accent hover:text-accent"
    >
      <span className="ns-eq" data-on={enabled || undefined} aria-hidden>
        <i /><i /><i /><i />
      </span>
      <span className="hidden sm:inline">Sound {enabled ? "on" : "off"}</span>
    </button>
  );
}
