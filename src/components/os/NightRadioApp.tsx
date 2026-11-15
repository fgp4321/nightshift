"use client";

import { useEffect, useRef } from "react";
import { STATIONS } from "@/data/stations";
import { useAudio } from "@/hooks/useAudio";
import { getAnalyser } from "@/lib/audio/engine";

const BARS = 28;

/** Draws the live spectrum of the ambience engine. Flat line when silent. */
function Spectrum({ playing, reducedMotion }: { playing: boolean; reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    const bins = new Uint8Array(64);
    let frame = 0;
    let timer: number | undefined;

    const draw = () => {
      const analyser = getAnalyser();
      if (playing && analyser) analyser.getByteFrequencyData(bins);
      else bins.fill(0);
      const { width, height } = canvas;
      context.clearRect(0, 0, width, height);
      const gap = 2 * ratio;
      const barWidth = (width - gap * (BARS - 1)) / BARS;
      for (let i = 0; i < BARS; i++) {
        const level = bins[Math.floor((i / BARS) * 40)] / 255;
        const barHeight = Math.max(ratio, level * height);
        context.fillStyle = level > 0.72 ? "#fcee0a" : "#00e5ff";
        context.fillRect(i * (barWidth + gap), height - barHeight, barWidth, barHeight);
      }
      if (!playing) return;
      // Reduced motion: refresh a few times a second instead of every frame.
      if (reducedMotion) timer = window.setTimeout(draw, 300);
      else frame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [playing, reducedMotion]);

  return <canvas ref={canvasRef} className="h-20 w-full" aria-hidden />;
}

/** NIGHT RADIO — transport, ambience selection, volume and mute. */
export function NightRadioApp({ reducedMotion }: { reducedMotion: boolean }) {
  const { enabled, volume, muted, station, toggle, changeVolume, toggleMute, changeStation } = useAudio();
  const current = STATIONS.find((item) => item.id === station) ?? STATIONS[0];
  const status = !enabled ? "Standby" : muted ? "Muted" : "On air";

  return (
    <div data-lenis-prevent className="flex h-full flex-col gap-4 overflow-y-auto overscroll-contain p-4">
      <div className="border border-ns-line p-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="ns-monument text-4xl text-ns-white">{current.band}</p>
          <p className="ns-label flex items-center gap-2" role="status">
            <span className={`size-1.5 ${enabled && !muted ? "animate-pulse bg-ns-magenta" : "bg-ns-gray"}`} aria-hidden />
            <span className={enabled && !muted ? "text-ns-white" : "text-ns-gray"}>{status}</span>
          </p>
        </div>
        <p className="ns-label mt-1 text-ns-cyan">{current.name}</p>
        <div className="mt-3">
          <Spectrum playing={enabled && !muted} reducedMotion={reducedMotion} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={enabled ? "Pause" : "Play"}
          data-cursor={enabled ? "PAUSE" : "PLAY"}
          className="grid size-12 shrink-0 place-items-center bg-ns-cyan text-ns-black transition-colors hover:bg-ns-white"
        >
          {enabled ? (
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden><path d="M3 2h4v12H3zM9 2h4v12H9z" fill="currentColor" /></svg>
          ) : (
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden><path d="M4 2l10 6-10 6z" fill="currentColor" /></svg>
          )}
        </button>
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="ns-label flex justify-between text-ns-gray">
            Volume <span className="text-ns-white">{Math.round(volume * 100)}</span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(event) => changeVolume(Number(event.target.value) / 100)}
            className="ns-range"
          />
        </label>
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={muted}
          className="ns-label h-12 shrink-0 border border-ns-line px-3 text-ns-white transition-colors hover:border-ns-cyan aria-pressed:border-ns-magenta aria-pressed:text-ns-magenta"
        >
          {muted ? "Unmute" : "Mute"}
        </button>
      </div>

      <fieldset>
        <legend className="ns-label mb-2 text-ns-gray">Ambience</legend>
        <ul className="space-y-1">
          {STATIONS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => changeStation(item.id)}
                aria-pressed={item.id === station}
                data-cursor="TUNE"
                className="group flex w-full items-baseline gap-3 border border-ns-line px-3 py-2 text-left transition-colors hover:border-ns-cyan aria-pressed:border-ns-cyan aria-pressed:bg-ns-cyan/10"
              >
                <span className="ns-label w-10 shrink-0 text-ns-cyan">{item.band}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ns-white">{item.name}</span>
                  <span className="block text-xs text-ns-gray">{item.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </fieldset>
      <p className="ns-label text-ns-gray">Synthesised live in your browser. No recordings.</p>
    </div>
  );
}
