"use client";

import type { ComponentType } from "react";
import { NightCityScene } from "@/components/city/NightCityScene";
import { BeyondGrid } from "@/components/finale/BeyondGrid";
import { CyberpunkOS } from "@/components/os/CyberpunkOS";
import { UndergroundScene } from "@/components/underground/UndergroundScene";
import { SCENES, sceneElementId, type SceneId } from "@/data/scenes";
import { useExperienceStore } from "@/store/experienceStore";

const STAGES: Record<SceneId, ComponentType<{ active: boolean }>> = {
  city: NightCityScene,
  os: CyberpunkOS,
  underground: UndergroundScene,
  beyond: BeyondGrid,
};

/**
 * One continuous scroll track. Each act is a tall, empty section that only
 * provides scroll distance (and therefore pacing); its content is a
 * fixed, full-viewport stage shown while that act is current. Acts hand
 * over by cutting on a covered frame, so stages never slide past each other.
 */
export function SceneManager() {
  const currentScene = useExperienceStore((s) => s.currentScene);

  return (
    <main id="experience">
      {SCENES.map((scene) => {
        const Stage = STAGES[scene.id];
        const active = scene.id === currentScene;
        return (
          <section
            key={scene.id}
            id={sceneElementId(scene.id)}
            data-scene={scene.id}
            aria-label={`Act ${scene.act} — ${scene.title}`}
            style={{ height: `${scene.length * 100}svh` }}
          >
            <div className="fixed inset-0 overflow-hidden" style={{ visibility: active ? "visible" : "hidden" }}>
              <Stage active={active} />
            </div>
          </section>
        );
      })}
    </main>
  );
}
