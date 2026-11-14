import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SCENES, sceneElementId } from "@/data/scenes";
import { setSceneProgress, setTotalProgress } from "@/lib/progress";
import { useExperienceStore } from "@/store/experienceStore";

gsap.registerPlugin(ScrollTrigger);

/**
 * The only place ScrollTriggers are created for scene bookkeeping:
 * one trigger for overall progress and one per act. Scene modules animate
 * from `lib/progress` rather than registering competing triggers.
 *
 * Scenes hold their stage with CSS `position: sticky` instead of
 * ScrollTrigger pinning, so there are no pin-spacers to recalculate and
 * resize / refresh / deep-links stay deterministic.
 *
 * Returns a cleanup function.
 */
export function createMasterTimeline(root: HTMLElement): () => void {
  const ctx = gsap.context(() => {
    ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => setTotalProgress(self.progress),
    });

    const last = SCENES.length - 1;
    SCENES.forEach((scene, index) => {
      const el = document.getElementById(sceneElementId(scene.id));
      if (!el) return;

      // Derived from progress rather than toggle events, so the active act is
      // also correct after a refresh, a resize or a jump that skips acts.
      const sync = (self: ScrollTrigger) => {
        setSceneProgress(scene.id, self.progress);
        const entered = index === 0 || self.progress > 0;
        const notLeft = index === last || self.progress < 1;
        if (entered && notLeft) useExperienceStore.getState().setScene(scene.id);
      };

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        // The last act has nothing after it: its stage never scrolls away.
        end: index === last ? "bottom bottom" : "bottom top",
        onUpdate: sync,
        onRefresh: sync,
      });
    });
  }, root);

  return () => ctx.revert();
}
