import * as THREE from "three";
import {
  beaconFragment,
  buildingFragment,
  buildingVertex,
  groundFragment,
  highwayFragment,
  rainFragment,
  rainVertex,
  signFragment,
  signVertex,
  skyFragment,
  skyVertex,
  worldVertex,
} from "@/shaders/cityShaders";
import { hologramFragment, hologramVertex } from "@/shaders/hologramShader";
import { HIGHWAY_COL, HIGHWAY_ROW, PITCH, SPIRE_HEIGHT, TERMINAL_Z, type CityLayout } from "./layout";
import { cityUniforms } from "./uniforms";

const { uTime, uFogColor, uFogDensity, uCamPos, uHolo } = cityUniforms;
const shared = { uTime, uFogColor, uFogDensity };

/** One draw call for every building in the city. */
export function createBuildings(layout: CityLayout): THREE.InstancedMesh {
  const { buildings } = layout;
  const geometry = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const seeds = new Float32Array(buildings.length);
  const tints = new Float32Array(buildings.length * 3);
  const material = new THREE.ShaderMaterial({ uniforms: shared, vertexShader: buildingVertex, fragmentShader: buildingFragment });
  const mesh = new THREE.InstancedMesh(geometry, material, buildings.length);
  const dummy = new THREE.Object3D();

  buildings.forEach((b, i) => {
    dummy.position.set(b.x, b.y, b.z);
    dummy.scale.set(b.w, b.h, b.d);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    seeds[i] = b.seed;
    tints.set(b.tint, i * 3);
  });
  geometry.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
  geometry.setAttribute("aTint", new THREE.InstancedBufferAttribute(tints, 3));
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false; // instances span the whole city
  return mesh;
}

export function createSigns(layout: CityLayout): THREE.InstancedMesh {
  const { signs } = layout;
  const geometry = new THREE.PlaneGeometry(1, 1);
  const seeds = new Float32Array(signs.length);
  const colors = new Float32Array(signs.length * 3);
  const sizes = new Float32Array(signs.length * 2);
  const material = new THREE.ShaderMaterial({
    uniforms: shared,
    vertexShader: signVertex,
    fragmentShader: signFragment,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, signs.length);
  const dummy = new THREE.Object3D();

  signs.forEach((s, i) => {
    dummy.position.set(s.x, s.y, s.z);
    dummy.rotation.set(0, s.rotation, 0);
    dummy.scale.set(s.w, s.h, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    seeds[i] = s.seed;
    colors.set(s.color, i * 3);
    sizes.set([s.w, s.h], i * 2);
  });
  geometry.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
  geometry.setAttribute("aColor", new THREE.InstancedBufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.InstancedBufferAttribute(sizes, 2));
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  mesh.renderOrder = 2;
  return mesh;
}

export function createGround(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(2400, 2400).rotateX(-Math.PI / 2);
  const material = new THREE.ShaderMaterial({
    uniforms: { ...shared, uHolo },
    vertexShader: worldVertex,
    fragmentShader: groundFragment,
  });
  return new THREE.Mesh(geometry, material);
}

/** Two elevated highways and their pillars. */
export function createHighways(layout: CityLayout): THREE.Group {
  const group = new THREE.Group();
  const length = 34 * PITCH;

  const deck = (axis: 0 | 1, center: number, height: number) => {
    const geometry = axis === 0 ? new THREE.BoxGeometry(length, 1.4, 11) : new THREE.BoxGeometry(11, 1.4, length);
    const material = new THREE.ShaderMaterial({
      uniforms: { ...shared, uAxis: { value: axis }, uCenter: { value: center } },
      vertexShader: worldVertex,
      fragmentShader: highwayFragment,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(axis === 0 ? 0 : center, height, axis === 0 ? center : 0);
    group.add(mesh);
  };
  deck(0, HIGHWAY_ROW * PITCH, 22.7);
  deck(1, HIGHWAY_COL * PITCH, 31.7);

  const pillarGeometry = new THREE.BoxGeometry(1.8, 1, 1.8).translate(0, 0.5, 0);
  const pillarMaterial = new THREE.MeshBasicMaterial({ color: 0x0a0c12 });
  const pillars = new THREE.InstancedMesh(pillarGeometry, pillarMaterial, layout.pillars.length);
  const dummy = new THREE.Object3D();
  layout.pillars.forEach((p, i) => {
    dummy.position.set(p.x, 0, p.z);
    dummy.scale.set(1, p.h, 1);
    dummy.updateMatrix();
    pillars.setMatrixAt(i, dummy.matrix);
  });
  pillars.instanceMatrix.needsUpdate = true;
  pillars.frustumCulled = false;
  group.add(pillars);
  return group;
}

/** Corner fins and beacon of the Kestrel-Vance Spire. */
export function createSpireDetails(): THREE.Group {
  const group = new THREE.Group();
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(1.3, 12, 8),
    new THREE.ShaderMaterial({ uniforms: { uTime }, vertexShader: worldVertex, fragmentShader: beaconFragment }),
  );
  beacon.position.set(0, SPIRE_HEIGHT + 15, 0);
  const mast = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 15, 0.6),
    new THREE.MeshBasicMaterial({ color: 0x1a1d26 }),
  );
  mast.position.set(0, SPIRE_HEIGHT + 7.5, 0);
  group.add(beacon, mast);
  return group;
}

/** Holographic access terminal in the plaza in front of the spire. */
export function createTerminal(): THREE.Group {
  const group = new THREE.Group();
  group.position.set(0, 0, TERMINAL_Z);

  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 1.2, 2.4).translate(0, 0.6, 0),
    new THREE.MeshBasicMaterial({ color: 0x07090d }),
  );
  const lip = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 0.07, 0.07).translate(0, 1.2, 1.2),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, toneMapped: false }),
  );
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 4.2),
    new THREE.ShaderMaterial({
      uniforms: { uTime, uHolo },
      vertexShader: hologramVertex,
      fragmentShader: hologramFragment,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }),
  );
  panel.position.set(0, 4.4, 0);
  panel.renderOrder = 3;
  group.add(plinth, lip, panel);
  return group;
}

export function createSky(): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1500, 24, 12),
    new THREE.ShaderMaterial({
      uniforms: { uFogColor },
      vertexShader: skyVertex,
      fragmentShader: skyFragment,
      side: THREE.BackSide,
      depthWrite: false,
    }),
  );
  mesh.renderOrder = -1;
  mesh.frustumCulled = false;
  return mesh;
}

export function createRain(count: number): THREE.LineSegments {
  const positions = new Float32Array(count * 6);
  const ends = new Float32Array(count * 2);
  const speeds = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 130;
    const y = Math.random() * 90;
    const z = Math.random() * 130;
    const speed = Math.random();
    positions.set([x, y, z, x, y, z], i * 6);
    ends.set([0, 1], i * 2);
    speeds.set([speed, speed], i * 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aEnd", new THREE.BufferAttribute(ends, 1));
  geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime, uCamPos },
    vertexShader: rainVertex,
    fragmentShader: rainFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(geometry, material);
  lines.frustumCulled = false;
  lines.renderOrder = 4;
  return lines;
}

/* ───────────── Lettered signs (canvas textures, original copy) ───────────── */

interface LetterSign {
  lines: string[];
  color: string;
  position: [number, number, number];
  size: [number, number];
}

const LETTER_SIGNS: LetterSign[] = [
  { lines: ["KESTREL//VANCE"], color: "#fcee0a", position: [0, 104, 14.4], size: [25, 4.6] },
  { lines: ["CORPORATE SECTOR", "AUTHORISED TRAFFIC ONLY"], color: "#fcee0a", position: [0, 27.4, 83.7], size: [22, 5.2] },
  { lines: ["NEURAL", "LEASE", "0% MEMORY TAX"], color: "#00e5ff", position: [-13.2, 31, 126], size: [6.6, 8] },
  { lines: ["SLEEP IS A", "PREMIUM", "FEATURE"], color: "#fcee0a", position: [13.2, 24, 106], size: [7, 7.4] },
  { lines: ["ORBIT", "NOODLE", "24H"], color: "#ff245e", position: [13.6, 36, 58], size: [6, 8] },
];

function drawLetterSign(canvas: HTMLCanvasElement, sign: LetterSign) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(6, 7, 10, 0.9)";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = sign.color;
  ctx.lineWidth = Math.max(4, height * 0.02);
  ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, width - ctx.lineWidth * 2, height - ctx.lineWidth * 2);

  const pad = width * 0.08;
  const lineHeight = (height - pad * 1.6) / sign.lines.length;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = sign.color;
  ctx.shadowColor = sign.color;
  ctx.shadowBlur = height * 0.06;
  sign.lines.forEach((line, i) => {
    let size = lineHeight * 0.92;
    ctx.font = `800 ${size}px "Barlow Condensed", "Arial Narrow", sans-serif`;
    const measured = ctx.measureText(line).width;
    if (measured > width - pad * 2) size *= (width - pad * 2) / measured;
    ctx.font = `800 ${size}px "Barlow Condensed", "Arial Narrow", sans-serif`;
    ctx.fillText(line, width / 2, pad * 0.8 + lineHeight * (i + 0.5));
  });
}

/**
 * Signs with readable copy. `redraw` repaints the textures; call it once
 * the web fonts are ready so the lettering uses the brand typeface.
 */
export function createLetterSigns(): { group: THREE.Group; redraw: () => void } {
  const group = new THREE.Group();
  const entries = LETTER_SIGNS.map((sign) => {
    const canvas = document.createElement("canvas");
    const scale = 512 / Math.max(...sign.size);
    canvas.width = Math.round(sign.size[0] * scale);
    canvas.height = Math.round(sign.size[1] * scale);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(sign.size[0], sign.size[1]),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false, side: THREE.DoubleSide }),
    );
    mesh.position.set(...sign.position);
    mesh.renderOrder = 2;
    group.add(mesh);
    return { canvas, texture, sign };
  });

  const redraw = () =>
    entries.forEach(({ canvas, texture, sign }) => {
      drawLetterSign(canvas, sign);
      texture.needsUpdate = true;
    });
  redraw();
  return { group, redraw };
}

/** Frees GPU resources of an object tree that React Three Fiber does not own. */
export function disposeObject(root: THREE.Object3D) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    materials.forEach((material) => {
      (material as THREE.MeshBasicMaterial).map?.dispose();
      material.dispose();
    });
    if ((object as THREE.InstancedMesh).isInstancedMesh) (object as THREE.InstancedMesh).dispose();
  });
}
