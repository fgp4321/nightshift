import { SCENES, sceneElementId, type SceneId } from "@/data/scenes";
import { getLenis } from "@/lib/scroll";
import { useExperienceStore } from "@/store/experienceStore";

/**
 * Moves the experience to the start of an act.
 * Guarded by `isTransitioning` so overlapping requests are ignored.
 */
export function navigateToScene(id: SceneId, options: { immediate?: boolean } = {}) {
  const store = useExperienceStore.getState();
  if (store.isTransitioning) return;

  const el = document.getElementById(sceneElementId(id));
  if (!el) return;

  // +1px lands inside the act so its trigger is unambiguously active.
  const target = Math.round(el.getBoundingClientRect().top + window.scrollY) + 1;
  const lenis = getLenis();
  const instant = options.immediate || store.capabilities.reducedMotion || !lenis;

  if (instant) {
    if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
    else window.scrollTo({ top: target, behavior: "auto" });
    return;
  }

  store.setTransitioning(true);
  lenis.scrollTo(target, {
    duration: 1.8,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    lock: true,
    force: true,
    onComplete: () => useExperienceStore.getState().setTransitioning(false),
  });
}

export function navigateRelative(direction: 1 | -1) {
  const { currentScene } = useExperienceStore.getState();
  const index = SCENES.findIndex((scene) => scene.id === currentScene);
  const next = SCENES[index + direction];
  if (next) navigateToScene(next.id);
}
