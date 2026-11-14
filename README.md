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
| Quality tiers | `src/utils/` | Capability detection and per-tier budgets for the 3D scenes. |
| Design tokens | `src/styles/design-tokens.css` | Colour, type, motion. One accent per world via `[data-scene]`. |

Decisions worth knowing:

- **Sticky stages, not pinning.** Each act is a tall section with a `position: sticky` 100svh stage. No pin-spacers, so resize, refresh and deep links stay deterministic.
- **Self-hosted fonts** (Fontsource): Orbitron, Space Grotesk, JetBrains Mono, Barlow Condensed. No request to Google Fonts.
- **Synthesised audio instead of Howler.** The ambience is generated in the browser, so there are no audio files to license or ship.
- **Motion ownership.** GSAP owns scroll-linked and cinematic motion; Motion owns UI state transitions. Never both on one property.

## Status

| Phase | State |
|---|---|
| 1 — Audit & foundation | Done |
| 2 — Design system & intro | Done |
| 3 — Night City 3D | Next |
| 4 — Cyberpunk OS | Pending |
| 5 — Neon Underground | Pending |
| 6 — Final act & motion polish | Pending |
| 7 — Responsive & optimisation | Pending |

### Documented placeholders

- `src/components/experience/ScenePlaceholder.tsx` stands in for all four scenes until Phases 3–6. It is wired to real scroll progress.
- `public/{models,textures,images,audio,fonts}` are empty. No asset is referenced that does not exist.
- Audio has a single city ambience bed and an on/off toggle. Per-world layers, volume and mute UI arrive with NIGHT RADIO (Phase 4) and Phase 6.
