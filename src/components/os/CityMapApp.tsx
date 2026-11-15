"use client";

import { useState } from "react";
import { DISTRICTS, type SecurityLevel } from "@/data/districts";

const SECURITY_TONE: Record<SecurityLevel, string> = {
  Maximum: "text-ns-magenta",
  High: "text-ns-yellow",
  Moderate: "text-ns-cyan",
  Low: "text-ns-white",
  Unmonitored: "text-ns-gray",
};

/** CITY MAP — clickable schematic of the five districts. */
export function CityMapApp() {
  const [selectedId, setSelectedId] = useState(DISTRICTS[0].id);
  const selected = DISTRICTS.find((district) => district.id === selectedId) ?? DISTRICTS[0];

  return (
    <div className="grid h-full grid-rows-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:grid-rows-1">
      <div className="relative min-h-[11rem] border-b border-ns-line md:border-b-0 md:border-r">
        <svg viewBox="0 0 400 300" className="absolute inset-0 size-full p-3" role="group" aria-label="Schematic map of the city">
          {/* Transit lines between districts and the Central Grid. */}
          <g stroke="currentColor" className="text-ns-cyan/40" strokeWidth="1" strokeDasharray="3 4" fill="none">
            <path d="M200 112 V122 M138 166 H100 M262 166 H300 M200 210 V224" />
          </g>
          {DISTRICTS.map((district) => {
            const active = district.id === selectedId;
            const buried = district.id === "underground";
            return (
              <g
                key={district.id}
                role="button"
                tabIndex={0}
                aria-label={`${district.name}, security ${district.security}`}
                aria-pressed={active}
                data-cursor={district.code}
                onClick={() => setSelectedId(district.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedId(district.id);
                  }
                }}
                className="ns-district cursor-pointer outline-none"
              >
                <polygon
                  points={district.shape}
                  strokeDasharray={buried ? "5 4" : undefined}
                  className={
                    active
                      ? "fill-ns-cyan/25 stroke-ns-cyan"
                      : "fill-ns-cyan/[0.04] stroke-ns-cyan/50 transition-colors hover:fill-ns-cyan/15"
                  }
                  strokeWidth={active ? 2 : 1}
                />
                <text
                  x={district.label[0]}
                  y={district.label[1]}
                  textAnchor="middle"
                  className={`pointer-events-none font-mono text-[9px] uppercase tracking-[0.14em] ${active ? "fill-ns-white" : "fill-ns-gray"}`}
                >
                  {district.code}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div data-lenis-prevent className="overflow-y-auto overscroll-contain p-4" aria-live="polite">
        <p className="ns-label text-ns-cyan">{selected.code}</p>
        <h3 className="ns-monument mt-1 text-3xl text-ns-white">{selected.name}</h3>
        <p className="ns-label mt-3 flex items-center gap-2">
          <span className="text-ns-gray">Security</span>
          <span className={SECURITY_TONE[selected.security]}>{selected.security}</span>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ns-white/85">{selected.description}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Districts">
          {DISTRICTS.map((district) => (
            <li key={district.id}>
              <button
                type="button"
                onClick={() => setSelectedId(district.id)}
                aria-pressed={district.id === selectedId}
                className="ns-label h-9 border border-ns-line px-2.5 text-ns-gray transition-colors hover:text-ns-white aria-pressed:border-ns-cyan aria-pressed:text-ns-cyan"
              >
                {district.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
