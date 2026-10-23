/** Two-note chime generated with Web Audio, so no audio asset is shipped. */
export function playChime(): void {
  // Browsers block audio until the page has had a user gesture. Skip quietly rather than warn.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
  try {
    const AudioCtor =
      window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = new AudioCtor();
    [523.25, 659.25].forEach((frequency, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + i * 0.25;
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.15, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.9);
    });
    window.setTimeout(() => void ctx.close(), 1500);
  } catch {
    // Sound is optional. Browsers can block audio, and the visual completion still shows.
  }
}
