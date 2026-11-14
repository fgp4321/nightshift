export type SceneId = "city" | "os" | "underground" | "beyond";

export interface SceneDefinition {
  id: SceneId;
  /** Narrative act number shown in the HUD. */
  act: string;
  title: string;
  /** District caption shown in the HUD. */
  district: string;
  tagline: string;
  /** In-world network state shown in the HUD. Fiction, labelled as such by context. */
  status: string;
  /** Scroll length of the scene in viewport heights. Drives pacing. */
  length: number;
}

/**
 * The single narrative spine. Scroll architecture, navigation and the HUD all
 * derive from this list — add or re-time an act here and nowhere else.
 */
export const SCENES: readonly SceneDefinition[] = [
  {
    id: "city",
    act: "01",
    title: "Night City",
    district: "District 01 — Corporate Sector",
    tagline: "The city is always watching.",
    status: "Network online",
    length: 5,
  },
  {
    id: "os",
    act: "02",
    title: "Cyberpunk OS",
    district: "Central Grid — NIGHT//OS",
    tagline: "Connection established.",
    status: "Link established",
    length: 3,
  },
  {
    id: "underground",
    act: "03",
    title: "Neon Underground",
    district: "Sublevel 9 — Neon District",
    tagline: "Reality is optional.",
    status: "Signal untraced",
    length: 6,
  },
  {
    id: "beyond",
    act: "04",
    title: "Beyond the Grid",
    district: "Outer perimeter",
    tagline: "The future is not waiting.",
    status: "Signal lost",
    length: 2,
  },
] as const;

export const SCENE_IDS = SCENES.map((s) => s.id);

export const sceneElementId = (id: SceneId) => `act-${id}`;

export const isSceneId = (value: string): value is SceneId =>
  (SCENE_IDS as string[]).includes(value);
