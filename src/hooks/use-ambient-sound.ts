"use client";

import { useEffect, useRef, useState } from "react";
import { buildAmbient } from "@/lib/ambient";
import type { AmbientSound } from "@/types";

/**
 * Plays the ambient sound while `active`. `level` is 0 to 1.
 * Browsers block audio until the user interacts with the page, so playback waits for the first click or key press.
 */
export function useAmbientSound(sound: AmbientSound, level: number, active: boolean) {
  const gainRef = useRef<GainNode | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  // "youtube" plays through its own player, so the generated graph stays silent.
  const playing = active && sound !== "off" && sound !== "youtube";

  useEffect(() => {
    if (!playing) return;
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
      const unlock = () => setUnlocked(true);
      document.addEventListener("pointerdown", unlock, { once: true });
      document.addEventListener("keydown", unlock, { once: true });
      return () => {
        document.removeEventListener("pointerdown", unlock);
        document.removeEventListener("keydown", unlock);
      };
    }

    const AudioCtor =
      window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = new AudioCtor();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    buildAmbient(ctx, sound, gain);
    gainRef.current = gain;
    return () => {
      gainRef.current = null;
      void ctx.close();
    };
  }, [playing, sound, unlocked]);

  // Volume changes adjust the live gain instead of rebuilding the audio graph.
  useEffect(() => {
    const gain = gainRef.current;
    if (gain) gain.gain.setTargetAtTime(playing ? level : 0, gain.context.currentTime, 0.2);
  }, [playing, sound, unlocked, level]);
}
