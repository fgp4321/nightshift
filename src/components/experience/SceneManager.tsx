"use client";

import type { ComponentType } from "react";
import { NightCityScene } from "@/components/city/NightCityScene";
import { CyberpunkOS } from "@/components/os/CyberpunkOS";
import { UndergroundScene } from "@/components/underground/UndergroundScene";
import { SCENES, sceneElementId, type SceneId } from "@/data/scenes";
import { useExperienceStore } from "@/store/experienceStore";
import { ScenePlaceholder } from "./ScenePlaceholder";

/** Real scenes, as they are built. Acts without one show the placeholder. */
const STAGES: Partial<Record<SceneId, ComponentType<{ active: boolean }>>> = {
  city: NightCityScene,
  os: CyberpunkOS,
  underground: UndergroundScene,
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
      {SCENES.map((scene, index) => {
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
              {Stage ? (
                <Stage active={active} />
              ) : (
                // PLACEHOLDER: replaced by the real scene in Phase 6.
                <ScenePlaceholder scene={scene} index={index} />
              )}
            </div>
          </section>
        );
      })}
    </main>
  );
}
