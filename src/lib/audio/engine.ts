/**
 * Procedural ambience, synthesised with the Web Audio API.
 * No audio files: nothing to license, nothing to download, nothing to break.
 * The context is only created after an explicit user gesture — never autoplay.
 *
 * Layers (city bed): low rumble (filtered brown noise), rain hiss (filtered
 * white noise) and a slow detuned drone. Per-world layers arrive in Phase 6.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let wanted = false;
let level = 0.6;
let suspendTimer: number | undefined;

function noiseBuffer(context: AudioContext, brown: boolean): AudioBuffer {
  const length = context.sampleRate * 4;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

function loop(context: AudioContext, buffer: AudioBuffer): AudioBufferSourceNode {
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.start();
  return source;
}

function build() {
  const context = new AudioContext();
  const out = context.createGain();
  out.gain.value = 0;
  out.connect(context.destination);

  // Rumble: distant traffic and machinery.
  const rumbleFilter = new BiquadFilterNode(context, { type: "lowpass", frequency: 170 });
  const rumbleGain = new GainNode(context, { gain: 0.5 });
  loop(context, noiseBuffer(context, true)).connect(rumbleFilter).connect(rumbleGain).connect(out);

  // Rain hiss.
  const rainFilter = new BiquadFilterNode(context, { type: "highpass", frequency: 2600 });
  const rainGain = new GainNode(context, { gain: 0.03 });
  loop(context, noiseBuffer(context, false)).connect(rainFilter).connect(rainGain).connect(out);

  // Drone: two detuned saws through a slowly breathing low-pass.
  const droneFilter = new BiquadFilterNode(context, { type: "lowpass", frequency: 190, Q: 3 });
  const droneGain = new GainNode(context, { gain: 0.05 });
  [55, 55.4, 82.6].forEach((frequency) => {
    const osc = new OscillatorNode(context, { type: "sawtooth", frequency });
    osc.connect(droneFilter);
    osc.start();
  });
  droneFilter.connect(droneGain).connect(out);
  const lfo = new OscillatorNode(context, { type: "sine", frequency: 0.06 });
  const lfoDepth = new GainNode(context, { gain: 70 });
  lfo.connect(lfoDepth).connect(droneFilter.frequency);
  lfo.start();

  // Never play into a hidden tab.
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.visibilityState === "hidden") void ctx.suspend();
    else if (wanted) void ctx.resume();
  });

  ctx = context;
  master = out;
}

function ramp(target: number, seconds: number) {
  if (!ctx || !master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(target, now + seconds);
}

/** Must be called from a user gesture the first time it enables audio. */
export async function setAmbienceEnabled(enabled: boolean) {
  wanted = enabled;
  window.clearTimeout(suspendTimer);
  if (enabled) {
    if (!ctx) build();
    await ctx?.resume();
    ramp(level, 1.4);
  } else if (ctx) {
    ramp(0, 0.5);
    suspendTimer = window.setTimeout(() => {
      if (!wanted) void ctx?.suspend();
    }, 600);
  }
}

export function setAmbienceVolume(volume: number) {
  level = volume;
  if (wanted) ramp(level, 0.15);
}

/** For diagnostics and tests. */
export function getAmbienceState() {
  return { created: ctx !== null, state: ctx?.state ?? "none", gain: master?.gain.value ?? 0, wanted };
}
