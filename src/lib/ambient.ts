import type { AmbientSound } from "../types";

export const AMBIENT_OPTIONS: { value: AmbientSound; label: string }[] = [
  { value: "off", label: "No sound" },
  { value: "rain", label: "Rain" },
  { value: "brown", label: "Brown noise" },
  { value: "pad", label: "Soft pad" },
  { value: "youtube", label: "YouTube link" },
];

/** Generated in the browser, so nothing is downloaded and no licence is needed. */
function noiseBuffer(ctx: AudioContext, kind: "white" | "brown"): AudioBuffer {
  const length = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    if (kind === "white") {
      data[i] = white * 0.5;
    } else {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  }
  return buffer;
}

function loopNoise(ctx: AudioContext, kind: "white" | "brown", output: AudioNode): void {
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx, kind);
  source.loop = true;
  source.connect(output);
  source.start();
}

/** Wires the chosen sound into `output`. Closing the context later stops everything. */
export function buildAmbient(ctx: AudioContext, sound: AmbientSound, output: AudioNode): void {
  if (sound === "brown") {
    loopNoise(ctx, "brown", output);
  } else if (sound === "rain") {
    // White noise through a low-pass filter that slowly sweeps, which reads as soft rain.
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2200;
    filter.connect(output);
    const sweep = ctx.createOscillator();
    sweep.frequency.value = 0.12;
    const depth = ctx.createGain();
    depth.gain.value = 700;
    sweep.connect(depth).connect(filter.frequency);
    sweep.start();
    loopNoise(ctx, "white", filter);
  } else if (sound === "pad") {
    // A quiet C major chord with a slow filter sweep.
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    const level = ctx.createGain();
    level.gain.value = 0.35;
    filter.connect(level).connect(output);
    for (const frequency of [130.81, 164.81, 196]) {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = frequency;
      osc.connect(filter);
      osc.start();
    }
  }
}
