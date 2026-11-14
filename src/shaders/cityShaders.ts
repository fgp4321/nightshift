/**
 * GLSL for the Corporate Sector. Everything is unlit: light is painted by
 * the shaders (windows, traffic, neon), which keeps the scene cheap enough
 * for phones while staying fully real-time 3D.
 */

const COMMON = /* glsl */ `
  uniform float uTime;
  uniform vec3 uFogColor;
  uniform float uFogDensity;

  // Stable for integer-valued inputs (cell ids, quantised seeds).
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  vec3 applyFog(vec3 color, float depth) {
    float f = 1.0 - exp(-uFogDensity * uFogDensity * depth * depth);
    return mix(color, uFogColor, clamp(f, 0.0, 1.0));
  }
`;

/* ───────────── Buildings (instanced boxes, procedural windows) ───────────── */

export const buildingVertex = /* glsl */ `
  attribute float aSeed;
  attribute vec3 aTint;
  varying vec3 vLocal;
  varying vec3 vSize;
  varying vec3 vNormalL;
  varying vec3 vTint;
  varying float vSeed;
  varying float vDepth;

  void main() {
    vec3 size = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
    vLocal = position * size; // metres, origin at the centre of the base
    vSize = size;
    vNormalL = normal;
    vTint = aTint;
    vSeed = aSeed;
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const buildingFragment = /* glsl */ `
  ${COMMON}
  varying vec3 vLocal;
  varying vec3 vSize;
  varying vec3 vNormalL;
  varying vec3 vTint;
  varying float vSeed;
  varying float vDepth;

  void main() {
    vec3 n = normalize(vNormalL);
    bool spire = vSeed >= 2.0;
    vec3 color = vec3(0.02, 0.024, 0.036);

    if (abs(n.y) < 0.5) {
      bool xFace = abs(n.x) > 0.5;
      float u = xFace ? vLocal.z : vLocal.x;
      float halfWidth = (xFace ? vSize.z : vSize.x) * 0.5;
      float face = xFace ? (n.x > 0.0 ? 1.0 : 2.0) : (n.z > 0.0 ? 3.0 : 4.0);

      vec2 grid = vec2(u / 2.4, vLocal.y / 3.3);
      vec2 cell = floor(grid);
      vec2 f = fract(grid);
      // Interpolated "constants" carry tiny errors that a hash amplifies
      // into noise, so the seed is snapped to an integer first.
      float seedI = floor(fract(vSeed) * 1024.0 + 0.5);
      vec2 id = cell + vec2(seedI * 3.0, seedI + face * 113.0);

      float density = spire ? 0.62 : mix(0.2, 0.68, hash(vec2(seedI, 2.0)));
      // Whole floors go dark, the way real offices do.
      density *= mix(0.25, 1.0, step(0.3, hash(vec2(cell.y, seedI + 53.0))));

      float r = hash(id);
      // A few windows switch on and off over time.
      float restless = step(0.94, hash(id + 7.7));
      float phase = floor(uTime * 0.18 + r * 12.0);
      r = mix(r, hash(id + vec2(phase, 0.0)), restless);
      float lit = step(1.0 - density, r);
      // The spire's lobby is a blank wall: a calm backdrop for the terminal.
      bool lobby = spire && vSeed < 2.2 && vLocal.y < 17.0;
      if (lobby) lit = 0.0;

      float mask = smoothstep(0.1, 0.18, f.x) * smoothstep(0.9, 0.82, f.x)
                 * smoothstep(0.22, 0.3, f.y) * smoothstep(0.86, 0.78, f.y);

      vec3 warm = vec3(1.0, 0.8, 0.5);
      vec3 window = mix(warm, vTint, step(0.55, hash(id + 19.0)));
      float brightness = 0.3 + 0.7 * hash(id + 3.3);

      // Far away the grid is sub-pixel: fade to its average to avoid shimmer.
      float detail = smoothstep(0.9, 0.3, max(fwidth(grid.x), fwidth(grid.y)));
      vec3 detailed = window * lit * mask * brightness * 1.15;
      vec3 average = window * density * 0.2;
      color += mix(average, detailed, detail);

      // Street light bleeding up the facade.
      color += vec3(0.95, 0.62, 0.25) * 0.07 * exp(-vLocal.y * 0.07);

      if (spire) {
        // Light strips on the corners of the tower.
        float edge = smoothstep(0.9, 0.0, halfWidth - abs(u));
        color += vTint * edge * 1.1;
        color += vTint * 0.035;
        color += vTint * 0.6 * smoothstep(0.35, 0.0, abs(vLocal.y - 17.0)) * step(vSeed, 2.2);
      }
    } else {
      color = vec3(0.028, 0.032, 0.046);
      if (spire) color += vTint * 0.25;
    }

    gl_FragColor = vec4(applyFog(color, vDepth), 1.0);
  }
`;

/* ───────────── Ground (streets, traffic, boulevard guide) ───────────── */

export const worldVertex = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying float vDepth;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 mv = viewMatrix * world;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const groundFragment = /* glsl */ `
  ${COMMON}
  uniform float uHolo;
  varying vec3 vWorld;
  varying float vDepth;

  const float PITCH = 26.0;
  const vec3 YELLOW = vec3(0.988, 0.933, 0.039);
  const vec3 CYAN = vec3(0.0, 0.898, 1.0);

  float streetDistance(float c) { return abs(fract(c / PITCH) - 0.5) * PITCH; }

  // Headlights / tail lights running along one axis of the grid.
  vec3 traffic(float along, float across, float acrossRaw, float otherDistance) {
    float inStreet = step(across, 4.0) * (1.0 - step(otherDistance, 4.0));
    float lane = smoothstep(0.55, 0.1, abs(across - 1.7));
    float side = sign(fract(acrossRaw / PITCH) - 0.5);
    float street = floor(acrossRaw / PITCH);
    float t = fract(along / 95.0 + side * uTime * 0.11 + hash(vec2(street, side)) );
    float car = pow(t, 26.0);
    vec3 light = side > 0.0 ? vec3(1.0, 0.93, 0.8) : vec3(1.0, 0.12, 0.1);
    return light * lane * car * inStreet * 1.5;
  }

  void main() {
    float dx = streetDistance(vWorld.x);
    float dz = streetDistance(vWorld.z);
    float street = max(step(dx, 4.0), step(dz, 4.0));

    vec3 color = mix(vec3(0.011, 0.013, 0.019), vec3(0.028, 0.032, 0.044), street);

    // Wet asphalt: broken reflections of the windows above.
    float wet = hash(floor(vWorld.xz / 2.5));
    color += street * vec3(0.9, 0.7, 0.35) * 0.035 * wet;

    // Kerb lines.
    float kerb = smoothstep(0.3, 0.0, abs(dx - 4.2)) + smoothstep(0.3, 0.0, abs(dz - 4.2));
    color += YELLOW * 0.045 * kerb;

    color += traffic(vWorld.z, dx, vWorld.x, dz);
    color += traffic(vWorld.x, dz, vWorld.z, dx);

    // The boulevard: a guide line pulling the eye towards the spire.
    float boulevard = step(abs(vWorld.x), 13.0) * step(36.0, vWorld.z);
    float guide = smoothstep(0.4, 0.0, abs(vWorld.x)) * step(0.55, fract(vWorld.z / 9.0 + uTime * 0.35));
    float rails = smoothstep(0.25, 0.0, abs(abs(vWorld.x) - 12.5));
    color += YELLOW * boulevard * (guide * 0.9 + rails * 0.25);

    // Plaza rings around the access terminal.
    float ring = length(vWorld.xz - vec2(0.0, 30.0));
    float pulse = fract(ring / 6.0 - uTime * 0.25);
    float rings = smoothstep(0.12, 0.0, abs(pulse - 0.5)) * smoothstep(22.0, 3.0, ring);
    color += CYAN * rings * (0.12 + 0.5 * uHolo);

    gl_FragColor = vec4(applyFog(color, vDepth), 1.0);
  }
`;

/* ───────────── Elevated highway deck ───────────── */

export const highwayFragment = /* glsl */ `
  ${COMMON}
  uniform float uAxis;   // 0: runs along X, 1: runs along Z
  uniform float uCenter; // position on the other axis
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying float vDepth;

  void main() {
    float along = mix(vWorld.x, vWorld.z, uAxis);
    float across = mix(vWorld.z, vWorld.x, uAxis) - uCenter;
    vec3 color = vec3(0.022, 0.026, 0.036);

    if (vNormalW.y > 0.5) {
      float side = sign(across);
      float lane = smoothstep(0.7, 0.1, abs(abs(across) - 2.2));
      float t = fract(along / 70.0 + side * uTime * 0.2 + side * 0.37);
      float car = pow(t, 18.0) + pow(fract(t + 0.43), 30.0);
      vec3 light = side > 0.0 ? vec3(1.0, 0.94, 0.82) : vec3(1.0, 0.12, 0.1);
      color += light * lane * car * 1.6;
    } else if (vNormalW.y < -0.5) {
      // Underside: service lamps.
      float lamp = smoothstep(0.9, 0.0, abs(fract(along / 13.0) - 0.5) * 13.0) * smoothstep(1.2, 0.0, abs(across));
      color += vec3(0.6, 0.9, 1.0) * lamp * 0.9;
    } else {
      float stripe = smoothstep(0.16, 0.06, abs(fract(vWorld.y) - 0.5));
      color += vec3(0.988, 0.933, 0.039) * stripe * 0.55;
    }

    gl_FragColor = vec4(applyFog(color, vDepth), 1.0);
  }
`;

/* ───────────── Neon signs (instanced planes, procedural glyphs) ───────────── */

export const signVertex = /* glsl */ `
  attribute float aSeed;
  attribute vec3 aColor;
  attribute vec2 aSize;
  varying vec2 vUv;
  varying vec2 vSizeM;
  varying vec3 vColor;
  varying float vSeed;
  varying float vDepth;
  void main() {
    vUv = uv;
    vSizeM = aSize;
    vColor = aColor;
    vSeed = aSeed;
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const signFragment = /* glsl */ `
  ${COMMON}
  varying vec2 vUv;
  varying vec2 vSizeM;
  varying vec3 vColor;
  varying float vSeed;
  varying float vDepth;

  void main() {
    vec2 cells = max(vec2(1.0), floor(vSizeM / 1.5));
    vec2 grid = vUv * cells;
    vec2 cell = floor(grid);
    vec2 f = fract(grid);

    // Invented glyphs: each cell is a 3×3 pattern of strokes.
    vec2 sub = floor(f * 3.0);
    float seedI = floor(vSeed * 1024.0 + 0.5);
    float stroke = step(0.42, hash(cell * 3.0 + sub + seedI));
    vec2 sf = fract(f * 3.0);
    float inner = step(0.12, f.x) * step(f.x, 0.88) * step(0.12, f.y) * step(f.y, 0.88);
    float glyph = stroke * inner * step(0.08, sf.x) * step(0.08, sf.y);

    vec2 edge = min(vUv, 1.0 - vUv) * vSizeM;
    float border = 1.0 - smoothstep(0.1, 0.18, min(edge.x, edge.y));

    // Rare, short power dips.
    float dip = step(0.93, hash(vec2(seedI, floor(uTime * 3.0))));
    float power = 1.0 - 0.6 * dip;

    vec3 color = vColor * (glyph * 1.25 + border) * power + vColor * 0.06;
    float alpha = max(max(glyph, border), 0.55);
    float fog = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
    gl_FragColor = vec4(mix(color, uFogColor, clamp(fog, 0.0, 1.0)), alpha);
  }
`;

/* ───────────── Sky dome ───────────── */

export const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

export const skyFragment = /* glsl */ `
  uniform vec3 uFogColor;
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y, 0.0, 1.0);
    vec3 zenith = vec3(0.012, 0.014, 0.026);
    // Light pollution: a faint warm band just above the skyline. It is zero
    // at the horizon itself so the sky meets the fogged ground seamlessly.
    float band = smoothstep(0.0, 0.08, h) * smoothstep(0.38, 0.08, h);
    vec3 low = uFogColor + vec3(0.045, 0.028, 0.004) * band;
    gl_FragColor = vec4(mix(low, zenith, smoothstep(0.1, 0.6, h)), 1.0);
  }
`;

/* ───────────── Rain (line segments wrapped around the camera) ───────────── */

export const rainVertex = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCamPos;
  attribute float aEnd;
  attribute float aSpeed;
  varying float vAlpha;
  const vec3 BOX = vec3(130.0, 90.0, 130.0);
  void main() {
    vec3 p = position;
    p.y -= uTime * (40.0 + aSpeed * 24.0);
    p = mod(p - uCamPos, BOX) - BOX * 0.5 + uCamPos;
    p.y += aEnd * (1.5 + aSpeed * 1.6);
    p.x += aEnd * 0.2;
    vec4 mv = viewMatrix * vec4(p, 1.0);
    vAlpha = smoothstep(65.0, 6.0, -mv.z) * (0.25 + 0.75 * aEnd);
    gl_Position = projectionMatrix * mv;
  }
`;

export const rainFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(0.62, 0.76, 0.92, vAlpha * 0.32);
  }
`;

/* ───────────── Beacon (pulsing aviation light) ───────────── */

export const beaconFragment = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;
  void main() {
    float pulse = 0.35 + 0.65 * smoothstep(0.6, 1.0, sin(uTime * 2.4) * 0.5 + 0.5);
    gl_FragColor = vec4(vec3(1.0, 0.141, 0.369) * pulse * 1.4, 1.0);
  }
`;
