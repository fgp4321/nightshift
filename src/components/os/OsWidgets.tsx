"use client";

import { useEffect, useRef, useState } from "react";
import { HolographicPanel } from "@/components/ui/HolographicPanel";

/** In-world system chatter. Fiction, rotated on a timer while the OS is visible. */
const MESSAGES = [
  "HALCYON: traffic rerouted around D-01 plaza",
  "weather order 77-B renewed (rain, light)",
  "grid load nominal — 94.1% of capacity",
  "guest session active on terminal 01",
  "maintenance band: carrier detected, source unknown",
  "Orbit Noodle outlet 0412 reports queue length 31",
  "spire airspace: 2 drones, 0 incidents",
  "trace 342 on carrier 88.7 — no result",
  "Helix Credit nightly interest run complete",
  "sublevel power draw: not on ledger",
];

function useClock(active: boolean) {
  const startRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!active) return;
    const started = Date.now();
    const write = () => {
      const seconds = Math.floor((Date.now() - started) / 1000);
      const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
      const ss = String(seconds % 60).padStart(2, "0");
      if (startRef.current) startRef.current.textContent = `${mm}:${ss}`;
    };
    write();
    const id = window.setInterval(write, 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return startRef;
}

/** Status, network and message widgets on the right of the desktop. */
export function OsWidgets({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const sessionRef = useClock(active);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!active || reducedMotion) return;
    const id = window.setInterval(() => setOffset((value) => (value + 1) % MESSAGES.length), 2800);
    return () => window.clearInterval(id);
  }, [active, reducedMotion]);

  const visible = Array.from({ length: 4 }, (_, i) => MESSAGES[(offset + i) % MESSAGES.length]);

  return (
    <aside aria-label="System widgets" className="grid content-start gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
      <HolographicPanel label="System" data-os-in className="p-4">
        <dl className="ns-label grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
          <dt className="text-ns-gray">Build</dt>
          <dd className="text-right text-ns-white">NIGHT//OS 7.7</dd>
          <dt className="text-ns-gray">Operator</dt>
          <dd className="text-right text-ns-white">HALCYON</dd>
          <dt className="text-ns-gray">Clearance</dt>
          <dd className="text-right text-ns-white">Guest</dd>
          <dt className="text-ns-gray">Session</dt>
          <dd className="text-right tabular-nums text-accent">
            <span ref={sessionRef}>00:00</span>
          </dd>
        </dl>
      </HolographicPanel>

      <HolographicPanel label="Network" data-os-in className="p-4">
        <div className="flex items-end justify-between gap-4">
          <div className="flex h-9 items-end gap-1" data-os="signal" aria-hidden>
            {[0.35, 0.5, 0.68, 0.84, 1].map((height) => (
              <span key={height} className="ns-signal-bar w-1.5 origin-bottom bg-accent" style={{ height: `${height * 100}%` }} />
            ))}
          </div>
          <p className="ns-label text-right">
            <span className="block text-ns-white">Central Grid</span>
            <span className="relative block">
              <span data-os="link-ok" className="text-ns-gray">Link stable</span>
              <span data-os="link-lost" className="invisible absolute right-0 top-0 whitespace-nowrap text-ns-magenta">
                Signal dropping
              </span>
            </span>
          </p>
        </div>
      </HolographicPanel>

      <HolographicPanel label="Messages" data-os-in className="p-4 max-lg:col-span-2 max-sm:col-span-1">
        <ol className="space-y-2" aria-live="off">
          {visible.map((message, i) => (
            <li key={message} className={`ns-label normal-case tracking-normal ${i === 3 ? "text-ns-white" : "text-ns-gray"}`}>
              <span className="text-accent" aria-hidden>
                ›{" "}
              </span>
              {message}
            </li>
          ))}
        </ol>
      </HolographicPanel>
    </aside>
  );
}
