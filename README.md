# NIGHT//SHIFT

An immersive, original cyberpunk experience in three interconnected worlds — the city, its operating system and the underground beneath it. One continuous, scroll-driven film in five acts.

> Cyberpunk 2077 is an atmospheric reference only. All branding, districts, corporations, interfaces and assets are original.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Lenis · Three.js / React Three Fiber / Drei · Motion · Web Audio · Zustand

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build && npm start
```

## Architecture

| Concern | Where | Notes |
|---|---|---|
| Narrative spine | `src/data/scenes.ts` | Acts, order and scroll length. Everything derives from it. |
| Discrete state | `src/store/experienceStore.ts` | Current scene, intro, audio, transition lock, device capabilities. |
| Per-frame progress | `src/lib/progress.ts` | Outside React; scrolling never re-renders. Read via `useExperienceProgress`. |
| Smooth scroll | `src/hooks/useLenis.ts` | One Lenis instance, driven by GSAP's ticker. Off under reduced motion. |
| Scroll bookkeeping | `src/animations/masterTimeline.ts` | The only ScrollTriggers that track acts. |
| Navigation | `src/animations/transitions.ts` | `navigateToScene` scrolls to an adjacent act; `travelToScene` cuts behind a full-screen wipe. Both guarded against overlapping transitions. Deep links: `/#os`, `/#underground`, `/#beyond`. |
| Scroll locks | `src/lib/scroll.ts` | Keyed (`boot`, `menu`, `transition`) so owners cannot unlock each other. |
| Boot sequence | `src/components/boot/SystemBoot.tsx` | ~4s, skippable (button or Esc), stored per session. |
| HUD & menu | `src/components/experience/` | Top HUD, bottom HUD, full-screen act index. Layers behind a modal are `inert`. |
| Audio | `src/lib/audio/engine.ts` | Synthesised ambience (Web Audio). No files, no autoplay; created on first user gesture. |
| Night City | `src/components/city/`, `src/lib/city/`, `src/shaders/` | Procedural, seeded layout → instanced meshes with unlit GLSL (windows, traffic, neon, hologram, rain). No lights, no post-processing, no model or texture files. |
| City camera & captions | `src/animations/cityAnimations.ts` | Two paused GSAP timelines (flight path, captions) scrubbed by the act's scroll progress. |
| Quality tiers | `src/utils/` | Capability detection and per-tier budgets for the 3D scenes. |
| Design tokens | `src/styles/design-tokens.css` | Colour, type, motion. One accent per world via `[data-scene]`. |

Decisions worth knowing:

- **Fixed stages, not pinning.** Each act is a tall, empty section that only provides scroll distance; its content is a fixed full-viewport stage shown while that act is current. No pin-spacers, so resize, refresh and deep links stay deterministic, and acts hand over on a covered frame instead of sliding past each other.
- **The city is painted, not lit.** Every surface is an unlit shader, which keeps ACT 01 to a handful of draw calls. Rendering stops while another act is on screen.
- **Degradation.** Three quality tiers set building count, rain density, pixel ratio and antialiasing. Reduced motion cuts between the five camera shots instead of flying. Without WebGL an SVG elevation of the same generated city is shown; captions and the hand-off still work.
- **Self-hosted fonts** (Fontsource): Orbitron, Space Grotesk, JetBrains Mono, Barlow Condensed. No request to Google Fonts.
- **Synthesised audio instead of Howler.** The ambience is generated in the browser, so there are no audio files to license or ship.
- **Motion ownership.** GSAP owns scroll-linked and cinematic motion; Motion owns UI state transitions. Never both on one property.

## Status

| Phase | State |
|---|---|
| 1 — Audit & foundation | Done |
| 2 — Design system & intro | Done |
| 3 — Night City 3D | Done |
| 4 — Cyberpunk OS | Next |
| 5 — Neon Underground | Pending |
| 6 — Final act & motion polish | Pending |
| 7 — Responsive & optimisation | Pending |

### Documented placeholders

- `src/components/experience/ScenePlaceholder.tsx` stands in for acts 02–04 until Phases 4–6. It is wired to real scroll progress.
- `public/{models,textures,images,audio,fonts}` are empty. No asset is referenced that does not exist.
- React Three Fiber 9.8 logs a `THREE.Clock` deprecation warning with three 0.187. It comes from the library, is harmless, and will go away with an R3F update.
- Audio has a single city ambience bed and an on/off toggle. Per-world layers, volume and mute UI arrive with NIGHT RADIO (Phase 4) and Phase 6.
