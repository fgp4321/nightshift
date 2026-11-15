import { DEFAULT_STATION, STATIONS, type AudioLayer } from "@/data/stations";

/**
 * Procedural ambience, synthesised with the Web Audio API.
 * No audio files: nothing to license, nothing to download, nothing to break.
 * The context is only created after an explicit user gesture — never autoplay.
 *
 * Five layers run continuously behind their own gains; a "station" is just a
 * mix of them, so changing station is a crossfade.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let layers: Record<AudioLayer, GainNode> | null = null;

let wanted = false;
let muted = false;
let level = 0.6;
let station = DEFAULT_STATION;
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

/** Turns a 0→1 sawtooth phase into a percussive decay envelope. */
function decayCurve(sharpness: number, offset = 0): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) {
    const phase = (i / (curve.length - 1) + offset) % 1;
    curve[i] = Math.exp(-phase * sharpness);
  }
  return curve;
}

function build() {
  const context = new AudioContext();
  const out = new GainNode(context, { gain: 0 });
  const meter = new AnalyserNode(context, { fftSize: 128, smoothingTimeConstant: 0.82 });
  out.connect(meter).connect(context.destination);

  const bus = (): GainNode => {
    const gain = new GainNode(context, { gain: 0 });
    gain.connect(out);
    return gain;
  };
  const built: Record<AudioLayer, GainNode> = { rumble: bus(), rain: bus(), drone: bus(), hum: bus(), club: bus() };
  const white = noiseBuffer(context, false);

  // Rumble: distant traffic and machinery.
  loop(context, noiseBuffer(context, true))
    .connect(new BiquadFilterNode(context, { type: "lowpass", frequency: 170 }))
    .connect(built.rumble);

  // Rain hiss.
  loop(context, white)
    .connect(new BiquadFilterNode(context, { type: "highpass", frequency: 2600 }))
    .connect(built.rain);

  // Drone: detuned saws through a slowly breathing low-pass.
  const droneFilter = new BiquadFilterNode(context, { type: "lowpass", frequency: 190, Q: 3 });
  [55, 55.4, 82.6].forEach((frequency) => {
    const osc = new OscillatorNode(context, { type: "sawtooth", frequency });
    osc.connect(droneFilter);
    osc.start();
  });
  droneFilter.connect(built.drone);
  const lfo = new OscillatorNode(context, { type: "sine", frequency: 0.06 });
  lfo.connect(new GainNode(context, { gain: 70 })).connect(droneFilter.frequency);
  lfo.start();

  // Hum: mains transformers plus fan noise.
  const humFilter = new BiquadFilterNode(context, { type: "lowpass", frequency: 320 });
  [50, 100, 150].forEach((frequency, i) => {
    const osc = new OscillatorNode(context, { type: i === 0 ? "square" : "sine", frequency });
    osc.connect(new GainNode(context, { gain: i === 0 ? 0.35 : 0.5 })).connect(humFilter);
    osc.start();
  });
  humFilter.connect(built.hum);
  loop(context, white)
    .connect(new BiquadFilterNode(context, { type: "bandpass", frequency: 900, Q: 2 }))
    .connect(new GainNode(context, { gain: 0.25 }))
    .connect(built.hum);

  // Club: a muffled kick at ~126 bpm and an off-beat hat, gated by a clock.
  const clock = new OscillatorNode(context, { type: "sawtooth", frequency: 2.1 });
  clock.start();
  const wall = new BiquadFilterNode(context, { type: "lowpass", frequency: 140 });
  const kick = new OscillatorNode(context, { type: "sine", frequency: 47 });
  const kickGate = new GainNode(context, { gain: 0 });
  const kickEnvelope = new WaveShaperNode(context, { curve: decayCurve(7) });
  clock.connect(kickEnvelope).connect(kickGate.gain);
  kick.connect(kickGate).connect(wall).connect(built.club);
  kick.start();
  const hatGate = new GainNode(context, { gain: 0 });
  const hatEnvelope = new WaveShaperNode(context, { curve: decayCurve(28, 0.5) });
  clock.connect(hatEnvelope).connect(hatGate.gain);
  loop(context, white)
    .connect(new BiquadFilterNode(context, { type: "bandpass", frequency: 5200, Q: 1.2 }))
    .connect(hatGate)
    .connect(new GainNode(context, { gain: 0.012 }))
    .connect(built.club);

  // Never play into a hidden tab.
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.visibilityState === "hidden") void ctx.suspend();
    else if (wanted) void ctx.resume();
  });

  ctx = context;
  master = out;
  analyser = meter;
  layers = built;
  applyStation(0);
}

function ramp(param: AudioParam, target: number, seconds: number) {
  if (!ctx) return;
  const now = ctx.currentTime;
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(target, now + Math.max(seconds, 0.01));
}

function applyStation(seconds: number) {
  if (!layers) return;
  const mix = (STATIONS.find((item) => item.id === station) ?? STATIONS[0]).mix;
  (Object.keys(layers) as AudioLayer[]).forEach((layer) => ramp(layers![layer].gain, mix[layer], seconds));
}

function applyMaster(seconds: number) {
  if (master) ramp(master.gain, wanted && !muted ? level : 0, seconds);
}

/** Must be called from a user gesture the first time it enables audio. */
export async function setAmbienceEnabled(enabled: boolean) {
  wanted = enabled;
  window.clearTimeout(suspendTimer);
  if (enabled) {
    if (!ctx) build();
    await ctx?.resume();
    applyMaster(1.2);
  } else if (ctx) {
    applyMaster(0.5);
    suspendTimer = window.setTimeout(() => {
      if (!wanted) void ctx?.suspend();
    }, 600);
  }
}

export function setAmbienceVolume(volume: number) {
  level = volume;
  applyMaster(0.12);
}

export function setAmbienceMuted(value: boolean) {
  muted = value;
  applyMaster(0.2);
}

export function setAmbienceStation(id: string) {
  station = id;
  applyStation(1.5);
}

/** Live spectrum of what is actually playing; null until audio has started. */
export function getAnalyser(): AnalyserNode | null {
  return analyser;
}
