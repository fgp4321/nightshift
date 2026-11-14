# NIGHT//SHIFT

An immersive, original cyberpunk experience in three interconnected worlds — the city, its operating system and the underground beneath it. One continuous, scroll-driven film in five acts.

> Cyberpunk 2077 is an atmospheric reference only. All branding, districts, corporations, interfaces and assets are original.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Lenis · Three.js / React Three Fiber / Drei · Motion · Howler · Zustand

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
| Navigation | `src/animations/transitions.ts` | `navigateToScene`, guarded against overlapping transitions. Deep links: `/#os`, `/#underground`, `/#beyond`. |
| Quality tiers | `src/utils/` | Capability detection and per-tier budgets for the 3D scenes. |
| Design tokens | `src/styles/design-tokens.css` | Colour, type, motion. One accent per world via `[data-scene]`. |

Decisions worth knowing:

- **Sticky stages, not pinning.** Each act is a tall section with a `position: sticky` 100svh stage. No pin-spacers, so resize, refresh and deep links stay deterministic.
- **Self-hosted fonts** (Fontsource): Orbitron, Space Grotesk, JetBrains Mono, Barlow Condensed. No request to Google Fonts.
- **Motion ownership.** GSAP owns scroll-linked and cinematic motion; Motion owns UI state transitions. Never both on one property.

## Status

| Phase | State |
|---|---|
| 1 — Audit & foundation | Done |
| 2 — Design system & intro | Next |
| 3 — Night City 3D | Pending |
| 4 — Cyberpunk OS | Pending |
| 5 — Neon Underground | Pending |
| 6 — Final act & motion polish | Pending |
| 7 — Responsive & optimisation | Pending |

### Documented placeholders

- `src/components/experience/ScenePlaceholder.tsx` stands in for all four scenes until Phases 3–6. It is wired to real scroll progress.
- `public/{models,textures,images,audio,fonts}` are empty. No asset is referenced that does not exist.
- `introComplete` is tracked and persisted per session, but the boot sequence itself arrives in Phase 2.
