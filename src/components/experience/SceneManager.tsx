import { SCENES, sceneElementId } from "@/data/scenes";
import { ScenePlaceholder } from "./ScenePlaceholder";

/**
 * Lays out the acts on one continuous scroll track. Each act is a tall
 * section whose 100svh stage sticks to the viewport while the visitor
 * scrolls through it; the section's height sets the act's pacing.
 */
export function SceneManager() {
  return (
    <main id="experience">
      {SCENES.map((scene, index) => (
        <section
          key={scene.id}
          id={sceneElementId(scene.id)}
          data-scene={scene.id}
          aria-label={`Act ${scene.act} — ${scene.title}`}
          className="relative"
          style={{ height: `${scene.length * 100}svh` }}
        >
          <div className="sticky top-0 h-svh overflow-hidden">
            {/* PLACEHOLDER (Phase 1): replaced by the real scene in Phases 3–6. */}
            <ScenePlaceholder scene={scene} index={index} />
          </div>
        </section>
      ))}
    </main>
  );
}
