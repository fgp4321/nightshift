import gsap from "gsap";
import { SCENES, sceneElementId, type SceneId } from "@/data/scenes";
import { getLenis, lockScroll, unlockScroll } from "@/lib/scroll";
import { useExperienceStore } from "@/store/experienceStore";

const CURTAIN_ID = "ns-curtain";

function sceneTop(id: SceneId): number | null {
  const el = document.getElementById(sceneElementId(id));
  if (!el) return null;
  // +1px lands inside the act so its trigger is unambiguously active.
  return Math.round(el.getBoundingClientRect().top + window.scrollY) + 1;
}

function jumpTo(top: number) {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo({ top, behavior: "auto" });
}

/**
 * Scrolls to the start of an act. Used for adjacent acts, where travelling
 * through the space is part of the story. Ignored while another transition
 * is running.
 */
export function navigateToScene(id: SceneId, options: { immediate?: boolean } = {}) {
  const store = useExperienceStore.getState();
  if (store.isTransitioning) return;
  const top = sceneTop(id);
  if (top === null) return;

  const lenis = getLenis();
  if (options.immediate || store.capabilities.reducedMotion || !lenis) {
    jumpTo(top);
    return;
  }

  store.setTransitioning(true);
  lenis.scrollTo(top, {
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

/**
 * Cuts to an act behind a full-screen wipe: cover → jump → reveal.
 * Used by the menu and act index, where scrolling through every act in
 * between would be slow and disorienting. `onCovered` runs while the screen
 * is hidden (e.g. to close the menu unseen).
 */
export function travelToScene(id: SceneId, options: { onCovered?: () => void } = {}) {
  const store = useExperienceStore.getState();
  if (store.isTransitioning) return;
  const curtain = document.getElementById(CURTAIN_ID);
  const scene = SCENES.find((item) => item.id === id);
  if (!curtain || !scene) return;

  const jump = () => {
    options.onCovered?.();
    const top = sceneTop(id);
    if (top !== null) jumpTo(top);
  };
  const finish = () => {
    gsap.set(curtain, { visibility: "hidden", clearProps: "clipPath,opacity" });
    unlockScroll("transition");
    useExperienceStore.getState().setTransitioning(false);
  };

  store.setTransitioning(true);
  lockScroll("transition");
  curtain.dataset.scene = id;
  const title = curtain.querySelector("[data-curtain-title]");
  const kicker = curtain.querySelector("[data-curtain-kicker]");
  if (title) title.textContent = scene.title;
  if (kicker) kicker.textContent = `Rerouting — Act ${scene.act}`;

  const tl = gsap.timeline({ onComplete: finish });
  if (store.capabilities.reducedMotion) {
    tl.set(curtain, { visibility: "visible", opacity: 0 })
      .to(curtain, { opacity: 1, duration: 0.2 })
      .call(jump)
      .to(curtain, { opacity: 0, duration: 0.2, delay: 0.3 });
    return;
  }
  tl.set(curtain, { visibility: "visible", clipPath: "inset(100% 0 0 0)" })
    .to(curtain, { clipPath: "inset(0% 0 0 0)", duration: 0.65, ease: "power3.inOut" })
    .call(jump)
    .to(curtain, { clipPath: "inset(0 0 100% 0)", duration: 0.75, ease: "power3.inOut", delay: 0.35 });
}
