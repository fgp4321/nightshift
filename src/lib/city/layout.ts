/**
 * Procedural, deterministic layout of the Corporate Sector.
 * Pure data — no Three.js — so it can be reused by the WebGL fallback.
 *
 * World units are metres. The grid is 26 m (18 m block + 8 m street).
 * +Z is "south": the camera arrives from +Z and travels towards the
 * Kestrel-Vance Spire at the origin along a cleared boulevard (x = 0).
 */
export const PITCH = 26;
export const BLOCK = 18;
export const HIGHWAY_ROW = 3; // z = 78, runs along X
export const HIGHWAY_COL = -4; // x = -104, runs along Z
export const TERMINAL_Z = 30;
export const SPIRE_HEIGHT = 236;

export type RGB = [number, number, number];

export const PALETTE = {
  yellow: [0.988, 0.933, 0.039] as RGB,
  cyan: [0.0, 0.898, 1.0] as RGB,
  magenta: [1.0, 0.141, 0.369] as RGB,
  warm: [1.0, 0.8, 0.52] as RGB,
  cool: [0.72, 0.84, 1.0] as RGB,
};

export interface BuildingInstance {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  /** [0,1) for regular buildings, ≥2 for the spire. */
  seed: number;
  tint: RGB;
}

export interface SignInstance {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  /** Rotation around Y in radians. 0 faces +Z (towards the arriving camera). */
  rotation: number;
  seed: number;
  color: RGB;
}

export interface PillarInstance {
  x: number;
  z: number;
  h: number;
}

export interface CityLayout {
  buildings: BuildingInstance[];
  signs: SignInstance[];
  pillars: PillarInstance[];
}

/** Small seeded PRNG (mulberry32). */
function createRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickTint(r: number): RGB {
  if (r < 0.34) return PALETTE.warm;
  if (r < 0.62) return PALETTE.cool;
  if (r < 0.84) return PALETTE.cyan;
  return PALETTE.yellow;
}

function pickSignColor(r: number): RGB {
  if (r < 0.45) return PALETTE.yellow;
  if (r < 0.87) return PALETTE.cyan;
  return PALETTE.magenta;
}

export function generateCity(maxBuildings: number, seed = 2077): CityLayout {
  const random = createRandom(seed);
  const buildings: BuildingInstance[] = [];
  const signs: SignInstance[] = [];

  // The spire: three stacked volumes. Always present, always first.
  buildings.push(
    { x: 0, y: 0, z: 0, w: 28, d: 28, h: 120, seed: 2.1, tint: PALETTE.yellow },
    { x: 0, y: 120, z: 0, w: 21, d: 21, h: 72, seed: 2.4, tint: PALETTE.yellow },
    { x: 0, y: 192, z: 0, w: 13, d: 13, h: SPIRE_HEIGHT - 192, seed: 2.7, tint: PALETTE.yellow },
  );

  // Candidate blocks, nearest first, so lower budgets keep the core.
  const RADIUS = 17;
  const blocks: { i: number; j: number; r: number }[] = [];
  for (let i = -RADIUS; i <= RADIUS; i++) {
    for (let j = -RADIUS; j <= RADIUS; j++) {
      const r = Math.hypot(i, j);
      if (r <= RADIUS) blocks.push({ i, j, r });
    }
  }
  blocks.sort((a, b) => a.r - b.r);

  for (const { i, j, r } of blocks) {
    if (buildings.length >= maxBuildings) break;
    const plaza = Math.abs(i) <= 1 && Math.abs(j) <= 1;
    const boulevard = i === 0 && j >= 1;
    if (plaza || boulevard || j === HIGHWAY_ROW || i === HIGHWAY_COL) continue;

    const cx = i * PITCH;
    const cz = j * PITCH;
    const metres = r * PITCH;
    const core = 125 * Math.exp(-((metres / 118) ** 2));
    const facesBoulevard = Math.abs(i) === 1 && j >= 1;

    const height = () => {
      let h = 10 + random() * 28 + core * (0.35 + 0.65 * random());
      if (random() < 0.08) h *= 1.4;
      return facesBoulevard ? Math.max(h, 46 + random() * 30) : h;
    };

    const add = (x: number, z: number, w: number, d: number) => {
      const h = height();
      buildings.push({ x, y: 0, z, w, d, h, seed: random(), tint: pickTint(random()) });

      // Facade banners on taller buildings.
      if (h > 36 && random() < 0.24 && !facesBoulevard) {
        const face = Math.floor(random() * 4);
        const sw = 3 + random() * 4;
        const sh = 8 + random() * 18;
        const sy = h * (0.35 + random() * 0.4);
        const out = 0.35;
        const pos =
          face === 0 ? { x, z: z + d / 2 + out, rot: 0 }
          : face === 1 ? { x, z: z - d / 2 - out, rot: Math.PI }
          : face === 2 ? { x: x + w / 2 + out, z, rot: Math.PI / 2 }
          : { x: x - w / 2 - out, z, rot: -Math.PI / 2 };
        signs.push({ x: pos.x, y: sy, z: pos.z, w: sw, h: sh, rotation: pos.rot, seed: random(), color: pickSignColor(random()) });
      }
    };

    const roll = random();
    if (facesBoulevard || roll < 0.55) {
      const inset = facesBoulevard ? 0 : random() * 3;
      add(cx, cz, BLOCK - inset, BLOCK - inset);
    } else if (roll < 0.85) {
      const half = BLOCK / 2 - 0.75;
      if (random() < 0.5) {
        add(cx - BLOCK / 4, cz, half, BLOCK);
        add(cx + BLOCK / 4, cz, half, BLOCK);
      } else {
        add(cx, cz - BLOCK / 4, BLOCK, half);
        add(cx, cz + BLOCK / 4, BLOCK, half);
      }
    } else {
      const q = BLOCK / 2 - 0.75;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(cx + (sx * BLOCK) / 4, cz + (sz * BLOCK) / 4, q, q);
    }

    // Blade signs over the boulevard, facing the arriving camera.
    if (facesBoulevard) {
      const count = 1 + Math.floor(random() * 2);
      for (let k = 0; k < count; k++) {
        const sw = 2.2 + random() * 1.6;
        signs.push({
          x: Math.sign(i) * (PITCH - BLOCK / 2 - 0.2 - sw / 2 - random() * 0.6),
          y: 11 + random() * 30,
          z: cz + BLOCK / 2 - 1 - random() * (BLOCK - 2),
          w: sw,
          h: 6 + random() * 10,
          rotation: 0,
          seed: random(),
          color: pickSignColor(random()),
        });
      }
    }
  }

  const pillars: PillarInstance[] = [];
  for (let k = -RADIUS; k <= RADIUS; k++) {
    if (k !== 0) pillars.push({ x: k * PITCH, z: HIGHWAY_ROW * PITCH, h: 22 });
    if (k !== HIGHWAY_ROW) pillars.push({ x: HIGHWAY_COL * PITCH, z: k * PITCH, h: 31 });
  }

  return { buildings, signs, pillars };
}
