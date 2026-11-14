/** Holographic panel of the access terminal. */
export const hologramVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const hologramFragment = /* glsl */ `
  uniform float uTime;
  uniform float uHolo;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float box(vec2 uv, vec2 lo, vec2 hi) {
    vec2 s = step(lo, uv) * step(uv, hi);
    return s.x * s.y;
  }

  void main() {
    vec3 cyan = vec3(0.0, 0.898, 1.0);
    vec2 uv = vUv;

    // Frame with open corners.
    vec2 edge = min(uv, 1.0 - uv);
    float frame = (1.0 - step(0.012, min(edge.x, edge.y)))
                * step(0.5, max(step(edge.x, 0.12), step(edge.y, 0.2)));

    // Rows of data: bars of varying length that re-roll now and then.
    float row = floor(uv.y * 14.0);
    float tick = floor(uTime * 1.5 + row * 0.37);
    float len = 0.15 + 0.6 * hash(vec2(row, tick));
    float bars = box(uv, vec2(0.08, 0.0), vec2(0.08 + len * 0.5, 1.0))
               * step(0.35, fract(uv.y * 14.0)) * step(fract(uv.y * 14.0), 0.65)
               * step(0.12, uv.y) * step(uv.y, 0.88);

    // Target ring on the right.
    vec2 c = (uv - vec2(0.76, 0.5)) * vec2(1.7, 1.0);
    float r = length(c);
    float ring = smoothstep(0.012, 0.0, abs(r - 0.26)) + smoothstep(0.012, 0.0, abs(r - 0.16)) * 0.6;
    float sweep = smoothstep(0.25, 0.0, abs(fract(atan(c.y, c.x) / 6.2832 + uTime * 0.2) - 0.5)) * step(r, 0.26);

    // Scan band moving up the panel.
    float scan = smoothstep(0.08, 0.0, abs(fract(uv.y - uTime * 0.22) - 0.5));
    float lines = 0.75 + 0.25 * sin(uv.y * 420.0);

    float flicker = 0.9 + 0.1 * step(0.5, hash(vec2(floor(uTime * 24.0), 1.0)));
    float power = mix(0.35, 1.0, uHolo);

    float glow = frame + bars * 0.8 + ring + sweep * 0.5;
    vec3 color = cyan * (glow + scan * 0.35 + 0.07) * lines * flicker * power;
    float alpha = clamp(glow + scan * 0.25 + 0.1, 0.0, 1.0) * power;
    gl_FragColor = vec4(color, alpha);
  }
`;
