"use client";

import { useEffect, useRef } from "react";
import { generateCity } from "@/lib/city/layout";
import { subscribeProgress } from "@/lib/progress";

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * The city seen from far away, drawn from the same generated layout as
 * ACT 01. As the visitor scrolls the camera pulls back and the lights go
 * out one by one — until a single one is left on.
 * Canvas 2D; redrawn only when progress or size changes.
 */
export function FinaleSkyline({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    // Far buildings first, so nearer ones paint over them.
    const lights = generateCity(900)
      .buildings.map((b, i) => ({
        x: b.x,
        z: b.z,
        h: b.y + b.h,
        color: `rgb(${b.tint.map((c) => Math.round(c * 255)).join(" ")})`,
        // Order in which lights fail; the spire's base (index 0) never does.
        order: i === 0 ? 2 : (Math.sin(i * 78.233) * 43758.5453) % 1,
        spire: i < 3,
      }))
      .map((light) => ({ ...light, order: light.spire ? light.order : Math.abs(light.order) }))
      .sort((a, b) => a.z - b.z);

    let current = 0;
    const draw = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const pull = reducedMotion ? 0.55 : smooth(0, 0.8, current);
      const scale = (Math.max(width, height) / 620) * (1.15 - pull * 0.8);
      const dark = smooth(0.08, 0.84, current);
      const cx = width / 2;
      const cy = height * (0.6 - pull * 0.08);

      for (const light of lights) {
        const alive = light.order > dark;
        if (!alive && !(light.spire && light.order === 2)) continue;
        const x = cx + light.x * scale;
        const base = cy + light.z * scale * 0.42;
        const top = base - light.h * scale * 0.55;
        const last = light.order === 2;
        // The last light: the spire's base turns from yellow to a lone point.
        context.globalAlpha = last ? 1 : Math.min(1, (light.order - dark) * 6) * 0.75;
        context.strokeStyle = last ? "#fcee0a" : light.color;
        context.lineWidth = Math.max(1, (last ? 3.2 : 1.6) * scale);
        context.beginPath();
        context.moveTo(x, last && dark > 0.95 ? base - 3 : top);
        context.lineTo(x, base);
        context.stroke();
      }
      context.globalAlpha = 1;
    };

    const unsubscribe = subscribeProgress(({ scenes }) => {
      current = scenes.beyond;
      draw();
    });
    window.addEventListener("resize", draw);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", draw);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden />;
}
