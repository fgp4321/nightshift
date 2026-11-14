import { SCENE_IDS, type SceneId } from "@/data/scenes";

/**
 * Per-frame narrative progress, kept outside React.
 * Written by the master scroll timeline; read by the 3D camera, HUD and
 * scene animations through `subscribeProgress` or directly inside a frame loop.
 */
export interface ProgressSnapshot {
  /** 0–1 across the whole experience. */
  total: number;
  /** 0–1 inside each scene. */
  scenes: Record<SceneId, number>;
}

export const progress: ProgressSnapshot = {
  total: 0,
  scenes: Object.fromEntries(SCENE_IDS.map((id) => [id, 0])) as Record<SceneId, number>,
};

type Listener = (snapshot: ProgressSnapshot) => void;
const listeners = new Set<Listener>();

export function subscribeProgress(listener: Listener): () => void {
  listeners.add(listener);
  listener(progress);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  listeners.forEach((listener) => listener(progress));
}

export function setTotalProgress(value: number) {
  progress.total = value;
  emit();
}

export function setSceneProgress(id: SceneId, value: number) {
  progress.scenes[id] = value;
  emit();
}
